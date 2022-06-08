import type {GetServerSideProps, NextPage} from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import {Button, Dropdown, Input, Link, Switch, SwitchEvent} from '@nextui-org/react';
import {Key, useCallback, useMemo, useState} from "react";
import {FundUser} from "./api/projects";
import absoluteUrl from 'next-absolute-url';

type SelectCurrencyItemProps = {
  key: string;
  name: string;
}

const Home: NextPage<FundUser> = (props) => {
  const router = useRouter();
  const currencies: SelectCurrencyItemProps[] = [
    {key:"USD", name:"USD"},
    {key:"EUR", name:"EUR"},
  ];

  const [funds, setFunds] = useState<Map<string, number>>(new Map());
  const [currency, setCurrency] = useState<Set<Key>>(new Set(["USD"]));
  const selectedCurrency = useMemo(() => {
    if (undefined === currency) return "Currency";
    return Array.from(currency.values()).join("");
  }, [currency]);

  const requestFunding = useCallback(async () => {
    const requestBody = {
      currency: selectedCurrency,
      projects: Array.from(funds.entries()).map(entry => ({name: entry[0], amount: entry[1]})),
    };
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

          <div key={"card_"+props.user} className={styles.card}>
            <Switch id="user" onChange={(e: SwitchEvent) => {
              handleToggle(e.target.checked, props.user)
            }}></Switch>
            <h2>{props.short}</h2>
            <p>{props.description}</p>
            <Input
                aria-label={"amount_"+props.user}
                id={"amount_"+props.user}
                disabled={!funds.has(props.user)}
                type="number"
                labelRight={selectedCurrency}
                onChange={(e) => {
                  handleToggle(true, props.user);
                }}
                initialValue={`${props.suggestedAmount}`} />
          </div>

          {
            props.projects.map(project => (
                <div key={"card_"+project.name} className={styles.card}>
                  <Switch onChange={(e: SwitchEvent) => {
                    handleToggle(e.target.checked, project.name)
                  }}></Switch>
                  <h2>{project.name}</h2>
                  <p>{project.description}</p>
                  <Input
                      aria-label={"amount_" + project.name}
                      id={"amount_" + project.name}
                      disabled={!funds.has(project.name)}
                      type="number"
                      labelRight={selectedCurrency}
                      onChange={(e) => {
                        handleToggle(true, project.name);
                      }}
                      initialValue={`${project.suggestedAmount}`} />
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
              {selectedCurrency}
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
