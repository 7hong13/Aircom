package com.aircom.data;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;

public interface ServiceAPI {
    @POST("/auth/signin")
    Call<SignInResponse> userLogin(@Body SignInData data);

    @POST("/auth/signup")
    Call<SignUpResponse> userJoin(@Body SignUpData data);

    @POST("/use-pcs")
    Call<PcAllocationResponse> allocationRequest(@Header("loginToken") String loginToken);

    @DELETE("/use-pcs/current")
    Call<PcDeallocationResponse> withdrawRequest(@Header("loginToken") String loginToken);

    @GET("/users/current")
    Call<AccountInfoResponse> accountInfoRequest(@Header("loginToken") String loginToken);

    @PUT("/users/current")
    Call<EditInfoResponse> editInfoRequest(@Header("loginToken") String loginToken, @Body EditInfoData editData);

    @DELETE("/users/current")
    Call<DeleteAccountResponse> deleteAccountRequest(@Header("loginToken") String loginToken);

    @GET("/users/current/remain-time")
    Call<SubscriptionResponse> subscriptionInfoRequest(@Header("loginToken") String loginToken);

    @POST("/charge/time")
    Call<Void> chargeTimeRequest(@Header("loginToken") String loginToken, @Body ChargeTimeData chargeTimeData);

    @POST("charge/subscription")
    Call<Void> chargeSubRequest(@Header("loginToken") String loginToken, @Body ChargeSubData chargeSubData);
}
