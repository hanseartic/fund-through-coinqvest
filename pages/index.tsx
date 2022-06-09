import type {GetServerSideProps, NextPage} from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import {Button, Dropdown, Input, Link, Switch, SwitchEvent} from '@nextui-org/react';
import {Key, useCallback, useEffect, useMemo, useState} from "react";
import {FundUser} from "./api/projects";
import absoluteUrl from 'next-absolute-url';

type SelectCurrencyItemProps = {
  key: string;
  name: string;
}

const Home: NextPage<FundUser> = (props) => {
  const router = useRouter();
  const currencies: SelectCurrencyItemProps[] = [
    {key:"XLM", name:"XLM"},
    {key:"ARS:GCYE7C77EB5AWAA25R5XMWNI2EDOKTTFTTPZKM2SR5DI4B4WFD52DARS", name:"ARS"},
    {key:"BRL:GDVKY2GU2DRXWTBEYJJWSFXIGBZV6AZNBVVSUHEPZI54LIS6BA7DVVSP", name:"BRL"},
    {key:"EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S", name:"EUR"},
    {key:"NGNT:GAWODAROMJ33V5YDFY3NPYTHVYQG7MJXVJ2ND3AOGIHYRWINES6ACCPD", name:"NGN"},
    {key:"USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", name:"USD"},
  ];

  const [funds, setFunds] = useState<Map<string, number>>(new Map());
  const [currency, setCurrency] = useState<Set<Key>>(new Set(["XLM"]));
  const [pathHash, setPathHash] = useState<string>();
  const selectedCurrency = useMemo(() => {
    if (undefined === currency) return currencies[0];
    const currencyKey = Array.from(currency.values()).join("");
    return currencies.find(c => c.key === currencyKey);
  }, [currency]);

  const requestFunding = useCallback(async () => {
    const requestBody = {
      currency: selectedCurrency!.key,
      projects: Array.from(funds.entries()).map(entry => ({name: entry[0], amount: entry[1]})),
    }
    const {checkoutUrl} = await fetch("/api/projects/fund", {method: "POST", body: JSON.stringify(requestBody)})
        .then(res => res.json())
        .catch(console.warn);

    Object.assign(document.createElement('a'), {
      target: '_blank',
      rel: 'noopener noreferrer',
      href: checkoutUrl
    }).click();
  }, [funds, selectedCurrency]);

  const totalFunding = useMemo(() => {
    return Array.from(funds.values()).reduce((previous, current) => {
      return previous + (isNaN(current) ? 0 : current);
    }, 0);
  }, [funds]);

  const handleToggle = (checked: boolean, project: string) => {
    const input = (document.getElementById("amount_"+project) as HTMLInputElement|undefined);
    if (input) {
      const inputValue = input.valueAsNumber;
      setFunds(currentFunds => {
        if (checked) {
          return new Map(currentFunds.set(project, inputValue).entries());
        } else {
          currentFunds.delete(project);
          return new Map(currentFunds.entries());
        }
      })
    }
  };

  useEffect(() => {
    if (pathHash !== undefined && router.isReady) {
      const newUrl = router.asPath.split('#')[0] + '#' + pathHash;
      router.push(newUrl, newUrl,{shallow: true}).catch(console.warn);
      Object.values(document.getElementsByClassName(styles.card)).forEach(card => {
        console.log(card.id)
        if (card.id === `card_${pathHash}`) {
          card.classList.add(styles.selected);
        } else {
          card.classList.remove(styles.selected);
        }
      });
    }
  }, [pathHash, router.isReady]);

  useEffect(() => {
    Object.keys(router.query).forEach(key => {
      handleToggle(true, key);
      if (router.isReady) {
        setPathHash(key);
      }
    })
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Fund me</title>
        <meta name="description" content="Buy me a coffee or donate to one of my projects" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to my donation page
        </h1>

        <p className={styles.description}>
          If you would like to fund my work in general or a particular project, you can fund me here.
        </p>

        <div className={styles.grid}>

          <div style={{width: "100%"}} className={styles.grid}>
            <div id={"card_"+props.user} key={"card_"+props.user} style={{maxWidth: 500}} className={`${styles.card}`}>
              <a id={props.user} />
              <Switch id="card_user"
                      initialChecked={props.user in router.query}
                      onChange={(e: SwitchEvent) => {
                handleToggle(e.target.checked, props.user)
              }}></Switch>
              <h2>{props.short}</h2>
              <p>{props.description}</p>
              <Input
                  aria-label={"amount_"+props.user}
                  id={"amount_"+props.user}
                  disabled={!funds.has(props.user)}
                  type="number"
                  labelRight={selectedCurrency?.name}
                  onChange={(e) => {
                    handleToggle(true, props.user);
                  }}
                  initialValue={`${router.query[props.user]??props.suggestedAmount}`} />
            </div>
          </div>
          {
            props.projects.map(project => (
                <div id={"card_"+project.name} key={"card_"+project.name} className={styles.card}>
                  <a id={project.name} />
                  <Switch id={"card_"+project.name}
                          initialChecked={project.name in router.query}
                          onChange={(e: SwitchEvent) => {
                    handleToggle(e.target.checked, project.name)
                  }}></Switch>
                  <h2>{project.name}</h2>
                  <p>{project.description}</p>
                  <Input
                      aria-label={"amount_" + project.name}
                      id={"amount_" + project.name}
                      disabled={!funds.has(project.name)}
                      type="number"
                      labelRight={selectedCurrency?.name}
                      onChange={(e) => {
                        handleToggle(true, project.name);
                      }}
                      initialValue={`${router.query[project.name]??project.suggestedAmount}`} />
                  <p><Link href={`https://github.com/${props.user}/${project.name}`} target={"_blank"} rel={"noreferrer"}>Project repo</Link></p>

                </div>
            ))
          }

        </div>
        <div className={styles.container}></div>
      </main>

      <footer className={styles.footer}>
        <p className={styles.grid}>
          <Button disabled={totalFunding <= 0} onPress={() => requestFunding()}>Fund selected</Button>&nbsp;with {totalFunding}&nbsp;
          <Dropdown type={"menu"}>
            <Dropdown.Button flat>
              {selectedCurrency?.name}
            </Dropdown.Button>
            <Dropdown.Menu
                variant={"flat"}
                aria-label="Dynamic Actions"
                items={currencies}
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={currency}
                onSelectionChange={(selection) => {
                  if (selection !== "all") {
                    setCurrency(selection)
                  }
                }}
            >
              {(item): JSX.Element => {
                if ("key" in item && "name" in item) {
                  const dropdownItem = item as SelectCurrencyItemProps;
                  return (
                      <Dropdown.Item
                          key={dropdownItem.key}>
                        {dropdownItem.name}
                      </Dropdown.Item>
                  )
                }
                return <></>
              }}
            </Dropdown.Menu>
          </Dropdown>
        </p>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
        <p className={styles.grid}>Spin your own funding page: Start from the&nbsp;<Link href="https://github.com/hanseartic/fund-through-coinqvest#readme" rel="noreferrer" target="_blank">github repo</Link>.</p>
      </footer>
    </div>
  )
}

const getServerSideProps: GetServerSideProps<FundUser> = async (context) => {
  const { origin } = absoluteUrl(context.req);
  const projectsURL = new URL("/api/projects", origin);
  return await fetch(projectsURL)
      .then(res => res.json())
      .then(json => ({props: json}))
}
export { getServerSideProps };
export default Home
