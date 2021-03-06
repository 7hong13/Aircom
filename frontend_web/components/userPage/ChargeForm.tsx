import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const Charge = () => {
    const loginToken = useSelector((state: RootState) => state.auth.loginToken);
    const [chargeInfo, setChargeInfo] = useState({
        hour: 1,
        productName: "",
        totalPrice: "",
        timeSelected: false,
        agreement: false,
        remainTime: 0,
        totalTime: 0,
        duration: "",
        itemSelected: false,
    });
    const [dueDate, setDueDate] = useState("");
    const chargeService = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (chargeInfo.agreement == false) {
            alert("약관에 동의해주세요");
            return;
        }
        if (chargeInfo.productName == "시간제") {
            axios.post(`${process.env.NEXT_PUBLIC_API_HOST}/charge/time`,
                { hours: chargeInfo.hour },
                { headers: { loginToken: loginToken } })
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    console.log(err);
                })
        }
        else if (chargeInfo.productName == "정액제 - 기본형" || chargeInfo.productName == "정액제 - 프로형") {
            axios.post(`${process.env.NEXT_PUBLIC_API_HOST}/charge/subscription`,
                { subscriptionMenuId: chargeInfo.productName == "정액제 - 기본형" ? 1 : 2},
                { headers: { loginToken: loginToken } })
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    console.log(err);
                })
        }
        else {
            alert("요금제를 선택해주세요");
            return;
        }
        alert("결제가 완료되었습니다");
    }
    const getSubscriptionInfo = () => {
        axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/users/current/remain-time`,
            { headers: { loginToken: loginToken } })
            .then((res) => {
                const hour = Math.round(res.data.remainTime / 3600000);
                const date = new Date();
                date.setDate(date.getDate() + 30);
                const due = date.getMonth() + 1 + "월 " + date.getDate() + "일 "
                    + date.getHours() + "시 " + date.getMinutes() + "분";
                setDueDate(due);
                setChargeInfo({...chargeInfo, remainTime: hour});
            })
            .catch((err) => {
                console.log(err);
            })
    };
    useEffect(() => {
        chargeInfo.timeSelected &&
            setChargeInfo({ ...chargeInfo, totalPrice: 300 * chargeInfo.hour + "원",
            totalTime: chargeInfo.remainTime + chargeInfo.hour })
    }, [chargeInfo.hour]);
    useEffect(() => {
        getSubscriptionInfo();
    }, [loginToken]);
    return (
        <div className="primaryContainer">
            <h1>시간 충전하기</h1>
            <div className="secondaryContainer">
                <div className="product">
                    <h2>충전 상품 선택</h2>
                    <input type="radio"
                        id="basic"
                        name="product"
                        value="basic"
                        onClick={() => {
                            setChargeInfo({
                                ...chargeInfo,
                                productName: "정액제 - 기본형",
                                totalPrice: "9,900원",
                                timeSelected: false,
                                itemSelected: true,
                                totalTime: chargeInfo.remainTime + 72,
                                duration: dueDate
                            })
                        }} />
                    <label htmlFor="basic">
                        <div className="name">정액제 - 기본형
                        <img src={require("../../public/images/plan_basic.png")} />
                        </div>
                        <div className="details">월 최대 72시간 사용 가능</div>
                        <div className="price">월 / 9,900원</div>
                    </label>
                    <input type="radio"
                        id="pro"
                        name="product"
                        value="pro"
                        onClick={() => {
                            setChargeInfo({
                                ...chargeInfo,
                                productName: "정액제 - 프로형",
                                totalPrice: "19,900원",
                                timeSelected: false,
                                itemSelected: true,
                                totalTime: chargeInfo.remainTime + 160,
                                duration: dueDate
                            })
                        }} />
                    <label htmlFor="pro">
                        <div className="name">정액제 - 프로형
                        <img src={require("../../public/images/plan_pro.png")} />
                        </div>
                        <div className="details">월 최대 160시간 사용 가능</div>
                        <div className="price">월 / 19,900원</div>
                    </label>
                    <input type="radio"
                        id="time"
                        name="product"
                        value="time"
                        onClick={() => {
                            setChargeInfo({
                                ...chargeInfo,
                                productName: "시간제",
                                totalPrice: 300 * chargeInfo.hour + "원",
                                timeSelected: true,
                                itemSelected: true,
                                totalTime: chargeInfo.remainTime + chargeInfo.hour,
                                duration: "-",
                            })
                        }} />
                    <label htmlFor="time">
                        <div className="name">시간제
                        <img id="time" src={require("../../public/images/plan_time.png")} />
                        </div>
                        <div className="details">1시간 기준</div>
                        <div className="price" id="timePrice">
                            <div className="calculateHour">
                                <button
                                    id="minusButton"
                                    onClick={() =>
                                        setChargeInfo({
                                            ...chargeInfo,
                                            hour: chargeInfo.hour == 1 ? 1 : chargeInfo.hour - 1
                                        })}>
                                    -
                                </button>
                                <div id="hour">{chargeInfo.hour}</div>
                                <button
                                    id="plusButton"
                                    onClick={() =>
                                        setChargeInfo({
                                            ...chargeInfo,
                                            hour: chargeInfo.hour + 1
                                        })}>
                                    +
                                </button>
                            </div>
                            <div className="pricePerHour">
                                1시간 / 300원
                            </div>
                        </div>
                    </label>
                </div>
                <div className="chargeInfo">
                    <h2>결제 정보</h2>
                    <div className="chargeDetails">
                        <div className="title">상품명</div>
                        <div className="value">{chargeInfo.productName}</div>
                    </div>
                    <div className="chargeDetails">
                        <div className="title">사용기간</div>
                        <div className="value">{chargeInfo.itemSelected
                            && chargeInfo.duration}</div>
                    </div>
                    <div className="chargeDetails">
                        <div className="title">현재 잔여시간</div>
                        <div className="value">{chargeInfo.itemSelected
                            && chargeInfo.remainTime + "시간"}</div>
                    </div>
                    <div className="chargeDetails">
                        <div className="title">충전 후 잔여시간</div>
                        <div className="value">{chargeInfo.itemSelected
                            && chargeInfo.totalTime + "시간"}</div>
                    </div>
                    <div className="chargeDetails">
                        <div className="title">총 결제금액</div>
                        <div className="value">{chargeInfo.totalPrice}</div>
                    </div>
                    <div className="agreement">
                        <p>약관 동의</p>
                        <div className="agreementDetails">
                            <p>위 상품 정보 및 거래 조건을 확인하였으며, 구매<br />진행에 동의합니다. (필수)</p>
                            <img
                                id="checkForAgree"
                                src={chargeInfo.agreement ?
                                    require("../../public/images/check_active.png")
                                    : require("../../public/images/check_inactive.png")}
                                onClick={() =>
                                    setChargeInfo({
                                        ...chargeInfo,
                                        agreement: chargeInfo.agreement ? false : true
                                    })
                                } />
                        </div>
                    </div>
                    <button onClick={chargeService}>결제하기</button>
                </div>
            </div>
            <style jsx>{`
                .primaryContainer, h1 {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    flex-direction: column;
                }
                h1 {
                    font-size: 32px;
                    margin-top: 60px;
                }
                .secondaryContainer{
                    display: flex;
                }
                h2 {
                    font-size: 24px;
                    white-space: nowrap;
                    margin-bottom: 30px;
                }
                .product, .chargeInfo {
                    margin-top: 20px;
                    margin-left: 40px;
                    margin-right: 40px;
                    margin-bottom: 50px;
                }
                input[type="radio"] {
                    display: none;
                }
                input[type="radio"]:checked+label {
                    border: solid 2px #0052cc;
                }   
                .product label {
                    display: flex;
                    flex-direction: column;
                    width: 320px;
                    height: 160px;
                    border-radius: 20px;
                    border: solid 2px #bbbbbb;
                    background-color: #ffffff;
                    cursor: pointer;
                    box-sizing: border-box;
                    transition: box-shadow 400ms ease;
                    margin-top: 20px;
                    margin-bottom: 20px;
                }  
                .name {
                    font-size: 22px;
                    font-weight: bold;
                    text-align: left;
                    padding-left: 30px;
                    padding-top: 22px;
                    display: inline-block;
                }
                img {
                    width: 40px;
                    height: 35px;
                    padding-left: 80px;
                    vertical-align: middle;
                }
                #time {
                    padding-left: 159px;
                }
                .details {
                    font-size: 18px;
                    text-align: left;
                    padding-left: 30px;
                    margin-top: 12px;
                }
                .price {
                    font-size: 20px;
                    font-weight: bold;
                    text-align: right;
                    padding-right: 30px;
                    margin-top: 23px;
                }
                #timePrice {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                }
                .calculateHour {
                    display: flex;
                    padding-right: 56px;
                }
                #minusButton, #plusButton {
                    border: solid 1px #a1a1a1;
                    background-color: #ffffff;
                    width: 30px;
                    height: 32px;
                }
                #minusButton {
                    border-top-left-radius: 8px;
                    border-bottom-left-radius: 8px;
                }
                #plusButton {
                    border-top-right-radius: 8px;
                    border-bottom-right-radius: 8px;
                }
                #hour {
                    border: solid 1px #b1b1b1;
                    border-right: 0px;
                    border-left: 0px;
                    width: 30px;
                    text-align: center;   
                    font-size: 16px;
                    line-height: 30px;
                }
                .chargeDetails {
                    display: flex;
                    width: 360px;
                    margin-top: 20px;
                }
                .title {
                    font-size: 20px;
                    font-weight: bold;
                }
                .value {
                    font-size: 20px;
                    margin-left: auto;
                }
                input[type="checkbox"] {
                    display: none;
                }
                #checkForAgree {
                    height: 16px;
                    width: 16px;
                }
                .agreementDetails {
                    display: flex;
                    width: 360px;
                }
                p {
                    font-size: 20px;
                    margin-top: 150px;
                }
                .agreementDetails p {
                    font-size: 16px;
                    color: #a1a1a1;
                    margin-top: 0px;
                    margin-right: -50px;
                }
                .chargeInfo button:active {
                    background-color: #b1b1b1;
                    border: solid 1px #b1b1b1;
                }
                .chargeInfo button {
                    width: 360px;
                    height: 50px;
                    border-radius: 15px;
                    background-color: #0052cc;
                    border: solid 1px #0052cc;
                    margin-top: 10px;
                    color: #ffffff;
                }
            `}</style>
        </div>
    );
};

export default Charge;