import React from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis } from 'recharts';

const LeftTime = () => {
    const providedTime = 72;
    const usedTime = 19;
    const leftTime = providedTime - usedTime;
    const width = (leftTime / providedTime) * 360;
    const productName = "정액제 - 프로형 / 월 최대 160시간 사용";
    const data = [
        {
            "name": "18일",
            "hour": 1.5,
        },
        {
            "name": "19일",
            "hour": 3,
        },
        {
            "name": "20일",
            "hour": 2,
        },
        {
            "name": "21일",
            "hour": 2.5,
        },
        {
            "name": "22일",
            "hour": 4,
        },
        {
            "name": "23일",
            "hour": 3,
        },
        {
            "name": "24일",
            "hour": 6,
        }
    ]
    return (
        <div className="primaryContainer">
            <div className="secondaryContainer">
                <div className="usage">
                    <h2>내 사용량</h2>
                    <div id="leftTime"></div>
                    <div id="usedTime" style={{ width: width }}></div>
                    <div className="details">
                        <p id="left">잔여 <strong>{leftTime} 시간</strong></p>
                        <p id="used">사용 {usedTime} 시간</p>
                        <p>&nbsp;|&nbsp;</p>
                        <p id="provided">제공 <strong>{providedTime} 시간</strong></p>
                    </div>
                </div>
                <div className="product">
                    <h2>사용 중인 서비스</h2>
                    <p id="productName">{productName}</p>
                    <Link href="/user/charge">
                        <a>충전하러 가기</a>
                    </Link>
                </div>
            </div>
            <div className="dailyUsage">
                <h2>일일 사용량</h2>
                <div className="chart">
                    <AreaChart width={730} height={250} data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0052cc" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#0052cc" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 16 }} />
                        <YAxis tick={{ fontSize: 16 }} unit={"시간"}/>
                        <Area type="monotone" dataKey="hour" stroke="#0052cc"
                            fillOpacity={1} fill="url(#color)" />
                    </AreaChart>
                </div>
            </div>
            <style jsx>{`
                *{
                    font-family: "Apple SD Gothic";
                }
                .usage, .product {
                    width: 400px;
                    height: 200px;
                    border-radius: 20px;
                    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.15);
                    background-color: #ffffff;
                    margin-right: 20px;
                    margin-left: 20px;
                    margin-top: 60px;
                }
                .dailyUsage {
                    width: 840px;
                    height: 400px;
                    border-radius: 20px;
                    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.15);
                    background-color: #ffffff;
                    margin-top: 40px;
                    margin-bottom: 100px;
                }
                .primaryContainer {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .secondaryContainer {
                    display: flex;
                }
                h2 {
                    font-size: 24px;
                    white-space: nowrap;
                    padding-left: 24px;
                    padding-top: 15px;
                }
                #usedTime, #leftTime{
                    position: absolute;
                    height: 20px;
                    margin-top: 10px;
                    margin-left: 20px;
                }
                #usedTime {
                    background-color: #0052cc;
                    border-top-left-radius: 10px;
                    border-bottom-left-radius: 10px;
                }
                #leftTime {
                    width: 360px;
                    border-radius: 10px;
                    background-color: #dddddd;
                }
                .details {
                    display: flex;
                    font-size: 20px;
                    padding-left: 20px;
                    padding-top: 30px;
                    padding-right: 20px;
                }
                #left {
                    margin-right: auto;
                }
                #left, #used {
                    color: #0052cc;
                }
                #productName {
                    font-size: 20px;
                    padding-left: 24px;
                    margin-top: 10px;
                }
                .product {
                    display: flex;
                    flex-direction: column;
                }
                a {
                    font-size: 18px;
                    color: #0052cc;
                    text-decoration: none;
                    margin-left: auto;
                    padding-right: 24px;
                    padding-top: 20px;
                }
                .dailyUse {
                    display: flex;
                }
                .chart {
                    padding-left: 60px;
                    padding-top: 20px;
                }
            `}</style>
        </div>
    );
};

export default LeftTime;