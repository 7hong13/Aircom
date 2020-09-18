import React from "react";
import Layout from "../../components/layout/Layout";
import ManualForm from "../../components/managerPage/ManualForm";
import Nav from "../../components/nav/NavManager";

export default function Manual(){
    return (
        <Layout>
            <Nav/>
            <ManualForm/>
        </Layout>
    );
};