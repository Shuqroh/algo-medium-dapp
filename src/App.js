import React, { useState } from "react";
import Cover from "./components/Cover";
import "./App.css";
import Wallet from "./components/Wallet";
import { Container, Nav } from "react-bootstrap";
import Blogs from "./components/blog/Blogs";
import { indexerClient, myAlgoConnect } from "./utils/constants";
import { Notification } from "./components/utils/Notifications";

const App = function AppWrapper() {
  const [address, setAddress] = useState(null);
  const [name, setName] = useState(null);
  const [balance, setBalance] = useState(0);

  const fetchBalance = async (accountAddress) => {
      try {
          const response = await indexerClient
              .lookupAccountByID(accountAddress)
              .do()
          if (!response) return
          const _balance = response.account.amount;
          setBalance(_balance);
      } catch (error) {
          console.log(error);
      }

  };

  const connectWallet = async () => {
      try {
          const accounts = await myAlgoConnect
              .connect()

          const _account = accounts[0];
          setAddress(_account.address);
          setName(_account.name);
          await fetchBalance(_account.address);
      } catch (error) {
          console.log("Could not connect to MyAlgo wallet");
          console.error(error);
      }

  };

  const disconnect = () => {
    setAddress(null);
    setName(null);
    setBalance(null);
  };

  return (
    <>
      <Notification />
      {address ? (
        <Container fluid="md">
          <Nav className="justify-content-end pt-3 pb-5">
            <Nav.Item>
              <Wallet
                address={address}
                name={name}
                amount={balance}
                disconnect={disconnect}
                symbol={"ALGO"}
              />
            </Nav.Item>
          </Nav>
          <main>
            <Blogs address={address} fetchBalance={fetchBalance} />
          </main>
        </Container>
      ) : (
        <Cover
          name={"Medium Dapp"}
          coverImg={
            "https://play-lh.googleusercontent.com/hB9t3Z-mi284_49HA3nAuhO-W5Cyhje7r2P9McdgORoVCd-0SV54c12NMQWLHnqALw"
          }
          connect={connectWallet}
        />
      )}
    </>
  );
};

export default App;
