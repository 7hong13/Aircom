import React, { useState } from "react";

const LandingPageForm = () => {
    const h1 = ["태블릿, 스마트폰만 있다면", "언제 어디서나 경험하는 고사양의 PC 환경",
        "자주 쓰지 않더라도", "필요한 만큼만 쓰고 지불하는 합리적 가격",
        "선명한 화질과 함께", "실제 PC를 눈 앞에서 쓰는 듯한 경험"];
    const h2 = ["무거운 노트북은 이제 그만, 언제 어디서나 가볍게 즐기는 윈도우 PC",
        "값비싼 PC 구매 없이도 사용할 수 있는 고사양 윈도우 PC",
        "FHD 이상 해상도로 누리는 보다 생생한 화면"];
    const [index, setIndex] = useState(0);
    return (
            <div className="container">
                {index == 0 && <img src={require("../../public/images/slide-1.png")} alt="" />}
                {index == 1 && <img src={require("../../public/images/slide-2.png")} alt="" />}
                {index == 2 && <img src={require("../../public/images/slide-3.png")} alt="" />}
                <h1>{h1[2 * index]}<br />{h1[2 * index + 1]}</h1>
                <h2>{h2[index]}</h2>
                <a className="prev"
                    onClick={() => setIndex(index == 0 ? 2 : index - 1)}>
                    &#10094;
                    </a>
                <a className="next"
                    onClick={() => setIndex(index == 2 ? 0 : index + 1)}>
                    &#10095;
                    </a>
                <div className="dot1"
                    style={index == 0 ?
                        { backgroundColor: "#ffffff" } :
                        { backgroundColor: "#bbbbbb" }}>
                </div>
                <div className="dot2"
                    style={index == 1 ?
                        { backgroundColor: "#ffffff" } :
                        { backgroundColor: "#bbbbbb" }}>

                </div>
                <div className="dot3"
                    style={index == 2 ?
                        { backgroundColor: "#ffffff" } :
                        { backgroundColor: "#bbbbbb" }}>
                    </div>
                <style jsx>{`
                img {
                    width: 100vw;
                    height: 100vh;
                    opacity: 0.5;
                }
                h1 {
                    font-size: 4rem;
                    white-space: nowrap;
                    font-weight: normal;
                    font-stretch: normal;
                    font-style: normal;
                    line-height: normal;
                    letter-spacing: -0.17px;
                    color: #ffffff;
                    position: absolute;
                    align-text: center;
                    top: 33.33%;
                }
                h2{  
                    font-size: 2rem;
                    white-space: nowrap;
                    font-weight: normal;
                    font-stretch: normal;
                    font-style: normal;
                    line-height: normal;
                    letter-spacing: -0.17px;
                    color: #ffffff;
                    position: absolute;
                    align-text: center;
                    top: 60%;
                }
                .container {
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    position: relative;
                    text-align: center;
                    background-color: #000000; 
                }
                .prev, .next {
                    position: absolute;
                    cursor: pointer;
                    top: 50%;
                    color: #ffffff;
                    opacity: 0.5;
                    font-weight: bold;
                    font-size: 4rem;
                    transition: 0.6s ease;
                    border-radius: 0 3px 3px 0;
                  }

                .prev {
                    left: 5%;
                }

                .next {
                    right: 5%;
                }

                .dot1 {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    position: absolute;
                    transition: background-color 0.6s ease;
                    bottom: 20%;
                    left: 47%
                }

                .dot2 {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    position: absolute;
                    transition: background-color 0.6s ease;
                    bottom: 20%;
                  }

                .dot3 {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    position: absolute;
                    transition: background-color 0.6s ease;
                    bottom: 20%;
                    right: 47%
                }
                  
                @media(max-width: 800px){
                    h1, .prev, .next {
                        font-size: 3rem;
                    }
                    h2 {
                        font-size: 1.5rem;
                    }
                    .container {
                        max-width: 100%;
                        padding: 0;
                        margin: 0;
                    }
                }
                @media(max-width: 500px){
                    h2, .dot1, .dot2, .dot3 {
                        display: none;
                    }
                    .container {
                        max-width: 100%;
                        padding: 0;
                        margin: 0;
                    }
                    h1 {
                        font-size: 2rem;
                    }
                }
            `}</style>
            </div>
    );
};

export default LandingPageForm;