import type {NextApiRequest, NextApiResponse} from "next";

export type FundUser = {
    user: string,
    short: string,
    githubSponsor: boolean,
    description: string,
    suggestedAmount?: number,
    projects: ProjectProps[],
}
export type ProjectProps = {
    name: string;
    description: string;
    suggestedAmount?: number;
}


const handleGetProjects = (
    req: NextApiRequest,
    res: NextApiResponse<FundUser>) => {

    res.status(200).json(
        {
            user: "hanseartic",
            githubSponsor: true,
            short: "☕ Buy me a coffee",
            description: "I enjoy the sip while working. So this is really appreciated",
            suggestedAmount: 5,
            projects: [
                {
                    name: "stellar-resolve-claimant-predicates",
                    description: "JS module to resolve claimant predicates to flat-most possible representation at a given claim-at date.",
                },
                {
                    name: "stellar-claim",
                    description: "A UI to claim and send claimable balances on the stellar network.",
                },
                {
                    name: "stellar-quest",
                    description: "solutions and verifier for stellar quest (https://quest.stellar.org)"
                },
                {
                    name: "bad-signer",
                    description: "Creating a public record of a specific account-lockout-scheme."
                },
                {
                    name: "fund-through-coinqvest",
                    description: "a one-page to receive funding for github projects (this project)"
                },
                {
                    name: "react_gh_pages",
                    description: "A template for a cra app that is published on github pages"
                },
                {
                    name: "remark-qrcode-directive",
                    description: "QR-code directive plugin for remark"
                },
                {
                    name: "remark-env-directive",
                    description: "substitute environment variables in markdown directive plugin for remark"
                }
            ]
        }
    )
}

export default handleGetProjects
