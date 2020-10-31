#include "Limelight-internal.h"
#include <Port.h>

#define TEST_PORT_TIMEOUT_SEC 3

#define VALID_PORT_FLAG_MASK (ML_PORT_FLAG_TCP_47984 | \
                              ML_PORT_FLAG_TCP_47989 | \
                              ML_PORT_FLAG_TCP_48010 | \
                              ML_PORT_FLAG_UDP_47998 | \
                              ML_PORT_FLAG_UDP_47999 | \
                              ML_PORT_FLAG_UDP_48000 | \
                              ML_PORT_FLAG_UDP_48010)

#define PORT_FLAGS_MAX_COUNT 32

unsigned int LiGetPortFlagsFromStage(int stage)
{
    switch (stage)
    {
        case STAGE_RTSP_HANDSHAKE:
            return ML_PORT_FLAG_TCP_48010 | ML_PORT_FLAG_UDP_48010;

        case STAGE_CONTROL_STREAM_START:
            return ML_PORT_FLAG_UDP_47999;

        default:
            return 0;
    }
}

int LiGetProtocolFromPortFlagIndex(int portFlagIndex)
{
    // The lower byte is reserved for TCP
    return (portFlagIndex >= 8) ? IPPROTO_UDP : IPPROTO_TCP;
}

unsigned short LiGetPortFromPortFlagIndex(int portFlagIndex)
{
    switch (portFlagIndex)
    {
        // TCP ports
        case ML_PORT_INDEX_TCP_47984:
            return TCP_47984;
        case ML_PORT_INDEX_TCP_47989:
            return TCP_47989;
        case ML_PORT_INDEX_TCP_48010:
            return BOTH_48010;

        // UDP ports
        case ML_PORT_INDEX_UDP_47998:
            return UDP_47998;
        case ML_PORT_INDEX_UDP_47999:
            return UDP_47999;
        case ML_PORT_INDEX_UDP_48000:
            return UDP_48000;
        case ML_PORT_INDEX_UDP_48010:
            return BOTH_48010;

        default:
            LC_ASSERT(0);
            return 0;
    }
}

unsigned int LiTestClientConnectivity(const char* testServer, unsigned short referencePort, unsigned int testPortFlags)
{
    unsigned int failingPortFlags;
    struct addrinfo* serverAddrs;
    struct addrinfo* current;
    struct addrinfo hints;
    int i;
    int err;
    SOCKET sockets[PORT_FLAGS_MAX_COUNT];

    // Mask out invalid ports from the port flags
    testPortFlags &= VALID_PORT_FLAG_MASK;
    failingPortFlags = testPortFlags;

    // Initialize sockets array to -1
    memset(sockets, 0xFF, sizeof(sockets));

    err = initializePlatformSockets();
    if (err != 0) {
        Limelog("Failed to initialize sockets: %d\n", err);
        return ML_TEST_RESULT_INCONCLUSIVE;
    }

    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_flags = AI_ADDRCONFIG;

    err = getaddrinfo(testServer, NULL, &hints, &serverAddrs);
    if (err != 0 || serverAddrs == NULL) {
        Limelog("Failed to resolve test server: %d\n", err);
        serverAddrs = NULL;
        failingPortFlags = ML_TEST_RESULT_INCONCLUSIVE;
        goto Exit;
    }

    for (current = serverAddrs; failingPortFlags != 0 && current != NULL; current = current->ai_next) {
        // Test to see if this address is even reachable on a standard port.
        // This will let us distinguish between port-specific blocks and IP-specific blocks.
        SOCKET testSocket = connectTcpSocket((struct sockaddr_storage*)current->ai_addr,
                                             current->ai_addrlen,
                                             referencePort,
                                             TEST_PORT_TIMEOUT_SEC);
        if (testSocket == INVALID_SOCKET) {
            Limelog("Skipping unavailable test host\n");
            continue;
        }
        else {
            closeSocket(testSocket);
        }

        for (i = 0; i < PORT_FLAGS_MAX_COUNT; i++) {
            if (testPortFlags & (1 << i)) {
                sockets[i] = socket(hints.ai_family,
                                    LiGetProtocolFromPortFlagIndex(i) == IPPROTO_UDP ? SOCK_DGRAM : SOCK_STREAM,
                                    LiGetProtocolFromPortFlagIndex(i));
                if (sockets[i] == INVALID_SOCKET) {
                    err = LastSocketFail();
                    Limelog("Failed to create socket: %d\n", err);
                    failingPortFlags = ML_TEST_RESULT_INCONCLUSIVE;
                    goto Exit;
                }

                #ifdef LC_DARWIN
                {
                    // Disable SIGPIPE on iOS
                    int val = 1;
                    setsockopt(sockets[i], SOL_SOCKET, SO_NOSIGPIPE, (char*)&val, sizeof(val));
                }
                #endif

                ((struct sockaddr_in6*)current->ai_addr)->sin6_port = htons(LiGetPortFromPortFlagIndex(i));
                if (LiGetProtocolFromPortFlagIndex(i) == IPPROTO_TCP) {
                    // Enable non-blocking I/O for connect timeout support
                    if (setSocketNonBlocking(sockets[i] , 1) != 0) {
                        // If non-blocking sockets are not available, TCP tests are not supported
                        err = LastSocketFail();
                        Limelog("Failed to enable non-blocking I/O: %d\n", err);
                        failingPortFlags = ML_TEST_RESULT_INCONCLUSIVE;
                        goto Exit;
                    }

                    // Initiate an asynchronous connection
                    err = connect(sockets[i], current->ai_addr, current->ai_addrlen);
                    if (err < 0) {
                        err = (int)LastSocketError();
                        if (err != EWOULDBLOCK && err != EAGAIN && err != EINPROGRESS) {
                            Limelog("Failed to start async connect to TCP %u: %d\n", LiGetPortFromPortFlagIndex(i), err);

                            // Mask off this bit so we don't try to include it in pollSockets() below
                            testPortFlags &= ~(1 << i);
                        }
                    }
                }
                else {
                    const char buf[] = {'C', 'T', 'E', 'S', 'T'};
                    int j;

                    // Send a few packets since UDP is unreliable
                    for (j = 0; j < 3; j++) {
                        err = sendto(sockets[i], buf, sizeof(buf), 0, current->ai_addr, current->ai_addrlen);
                        if (err < 0) {
                            err = (int)LastSocketError();
                            Limelog("Failed to send test packet to UDP %u: %d\n", LiGetPortFromPortFlagIndex(i), err);

                            // Mask off this bit so we don't try to include it in pollSockets() below
                            testPortFlags &= ~(1 << i);

                            break;
                        }

                        PltSleepMs(50);
                    }
                }
            }
        }

        // Continue to call pollSockets() until we have no more sockets to wait for,
        // or our pollSockets() call times out.
        while (testPortFlags != 0) {
            int nfds;
            struct pollfd pfds[PORT_FLAGS_MAX_COUNT];
            
            nfds = 0;

            // Fill out our FD sets
            for (i = 0; i < PORT_FLAGS_MAX_COUNT; i++) {
                if (testPortFlags & (1 << i)) {
                    pfds[nfds].fd = sockets[i];

                    if (LiGetProtocolFromPortFlagIndex(i) == IPPROTO_UDP) {
                        // Watch for readability on UDP sockets
                        pfds[nfds].events = POLLIN;
                    }
                    else {
                        // Watch for writeability on TCP sockets
                        pfds[nfds].events = POLLOUT;
                    }

                    nfds++;
                }
            }

            // Wait for the  to complete or the timeout to elapse.
            // NB: The timeout resets each time we get a valid response on a port,
            // but that's probably fine.
            err = pollSockets(pfds, nfds, TEST_PORT_TIMEOUT_SEC * 1000);
            if (err < 0) {
                // pollSockets() failed
                err = LastSocketError();
                Limelog("pollSockets() failed: %d\n", err);
                failingPortFlags = ML_TEST_RESULT_INCONCLUSIVE;
                goto Exit;
            }
            else if (err == 0) {
                // pollSockets() timed out
                Limelog("Connection timed out after %d seconds\n", TEST_PORT_TIMEOUT_SEC);
                break;
            }

            // We know something was signalled. Now we just need to find out what.
            for (i = 0; i < nfds; i++) {
                if (pfds[i].revents != 0) {
                    int portIndex;

                    // This socket was signalled. Figure out what port it was.
                    for (portIndex = 0; portIndex < PORT_FLAGS_MAX_COUNT; portIndex++) {
                        if (sockets[portIndex] == pfds[i].fd) {
                            LC_ASSERT(testPortFlags & (1 << portIndex));
                            break;
                        }
                    }

                    LC_ASSERT(portIndex != PORT_FLAGS_MAX_COUNT);

                    if (LiGetProtocolFromPortFlagIndex(portIndex) == IPPROTO_UDP) {
                        char buf[32];

                        // A UDP socket was signalled. This could be because we got
                        // a packet from the test server, or it could be because we
                        // received an ICMP error which will be given to us from
                        // recvfrom().
                        testPortFlags &= ~(1 << portIndex);

                        // Check if the socket can be successfully read now
                        err = recvfrom(sockets[portIndex], buf, sizeof(buf), 0, NULL, NULL);
                        if (err >= 0) {
                            // The UDP test was a success.
                            failingPortFlags &= ~(1 << portIndex);

                            Limelog("UDP port %u test successful\n", LiGetPortFromPortFlagIndex(portIndex));
                        }
                        else {
                            err = LastSocketError();
                            Limelog("UDP port %u test failed: %d\n", LiGetPortFromPortFlagIndex(portIndex), err);
                        }
                    }
                    else {
                        // A TCP socket was signalled
                        SOCKADDR_LEN len = sizeof(err);
                        getsockopt(sockets[portIndex], SOL_SOCKET, SO_ERROR, (char*)&err, &len);
                        if (err != 0 || (pfds[i].revents & POLLERR)) {
                            // Get the error code
                            err = (err != 0) ? err : LastSocketFail();
                        }

                        // The TCP test has completed for this port
                        testPortFlags &= ~(1 << portIndex);
                        if (err == 0) {
                            // The TCP test was a success
                            failingPortFlags &= ~(1 << portIndex);

                            Limelog("TCP port %u test successful\n", LiGetPortFromPortFlagIndex(portIndex));
                        }
                        else {
                            Limelog("TCP port %u test failed: %d\n", LiGetPortFromPortFlagIndex(portIndex), err);
                        }
                    }
                }
            }

            // Next iteration, we'll remove the matching sockets from our FD set and
            // call select() again to wait on the remaining sockets.
        }

        // We don't need to try another server if we got this far
        break;
    }

    if (current == NULL) {
        // None of the addresses we were given worked
        failingPortFlags = ML_TEST_RESULT_INCONCLUSIVE;
        goto Exit;
    }

Exit:
    for (i = 0; i < PORT_FLAGS_MAX_COUNT; i++) {
        if (sockets[i] != INVALID_SOCKET) {
            closeSocket(sockets[i]);
        }
    }

    if (serverAddrs != NULL) {
        freeaddrinfo(serverAddrs);
    }

    cleanupPlatformSockets();
    return failingPortFlags;
}
