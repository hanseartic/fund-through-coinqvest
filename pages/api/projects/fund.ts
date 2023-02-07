import type {NextApiRequest, NextApiResponse} from "next";
import absoluteUrl from "next-absolute-url";
import {FundUser} from "./index";
import * as CoinqvestClient from "coinqvest-merchant-sdk";


type FundProjects = {name: string; amount: number}[];
type FundRequestBody = {currency: string; projects: FundProjects};

const getCoinqvestJson = (projects: FundUser, fundRequest: FundRequestBody, currentHost: string) => {

    const queryBody = {
        settlementCurrency: "XLM:NATIVE",
        charge:{
            currency:fundRequest.currency,
            lineItems: fundRequest.projects.map(project => ({
                description: "fund " + project.name,
                netAmount: project.amount,
            }))
        },
        links: {
            cancelUrl: currentHost,
            returnUrl: currentHost
        },
        pageSettings:{
            shopName:"Fund " + projects.user + " on github",
            displayBuyerInfo:true,
            displaySellerInfo:false
        },
    };
    if (currentHost.indexOf("http://localhost") !== -1) {
        delete (queryBody as {links?: {}}).links;
    }
    return queryBody;
}

const handleGetFunding = async (
    req: NextApiRequest,
    res: NextApiResponse) => {
    const { origin } = absoluteUrl(req);
    const projects: FundUser = await fetch(new URL("/api/projects", origin))
        .then(apiResponse => apiResponse.json())
        .catch(console.warn);

    const fundProjects: {currency: string, projects: FundProjects} = JSON.parse(req.body);
    fundProjects.projects.forEach(({name, amount}) => {
        if (name !== projects.user && !projects.projects.find(p => p.name === name)) {
            res.status(403).json({
                type: "project_unknown",
                project: name,
            })
        }
    });
    const requestBody = getCoinqvestJson(projects, fundProjects, origin);

    const coinqvestClient = new CoinqvestClient(
        process.env.COINQVEST_API_KEY,
        process.env.COINQVEST_API_SECRET
    );

    const coinqvestResponse: {status: number; data: {url: string}} = await coinqvestClient.post("/checkout/hosted", requestBody);
    if (coinqvestResponse.status !== 200) {
        res.status(coinqvestResponse.status).json({
            message: 'Could not create coinqvest checkout.'
        })
        return;
    }
    res.json({checkoutUrl: coinqvestResponse.data.url, r: requestBody});
};

export default handleGetFunding;
