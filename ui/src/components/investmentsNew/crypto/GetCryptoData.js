import { useEffect, useContext } from "react";
import { AppContext } from "../../../AppContext";
import axios from "axios";

const GetCryptoData = () => {
  const {
    cryptoData,
    setCryptoData,
    cryptoRefresh,
    cryptoMarketRefresh,
    setCryptoMarketRefresh,
  } = useContext(AppContext);

  async function fetchCryptoMarketData(idTags) {
    try {
      let params = {
        idTags: idTags.join(","),
      };
      let res = await axios.get("http://localhost:3001/crypto-market", {
        params,
      });
      return res.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  const getCryptoMarketData = async (idTags) => {
    let cryptoMarketDataAPI = [];
    try {
      cryptoMarketDataAPI = await fetchCryptoMarketData(idTags);
    } catch (error) {
      console.error("error retrieving crypto data");
    }
    return cryptoMarketDataAPI;
  };

  async function getCryptoDBData() {
    try {
      let res = await axios.get("http://localhost:3001/crypto");
      return res.data;
    } catch (err) {
      console.log(err);
      return;
    }
  }

  // on page load, get data
useEffect(() => {
  getCryptoDBData().then((items) => {
    if (items) {
      const transformedData = items.map((item) => ({
        id: item.crypto_id,
        ticker: item.ticker,
        name: item.name,
        url: item.url,
        shares: item.shares,
        totalSpent: item.total_spent,
        costBasis: (item.total_spent / item.shares).toFixed(2),
      }));

      setCryptoData((prevCryptoData) => {
        let updatedData = [...prevCryptoData];

        transformedData.forEach((newItem) => {
          const index = updatedData.findIndex(
            (item) => item.id === newItem.id
          );
          if (index > -1) {
            updatedData[index] = newItem;
          } else {
            updatedData.push(newItem);
          }
        });
        updatedData = updatedData.filter((item) =>
          transformedData.some((newItem) => newItem.id === item.id)
        );

        return updatedData;
      });

      setCryptoMarketRefresh((prev) => !prev);
    }
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [cryptoRefresh]);


  useEffect(() => {
    let isMounted = true;
    let idTags = [];

    if (isMounted && cryptoData.length > 0) {
      idTags = cryptoData.map((crypto) =>
        crypto.name.replace(/\s+/g, "-").toLowerCase()
      );
      getCryptoMarketData(idTags).then((marketData) => {
        const updatedData = cryptoData.map((crypto) => {
          const marketValue =
            marketData[crypto.name.replace(/\s+/g, "-").toLowerCase()]?.usd ||
            0;
          const currentValue = crypto.shares * marketValue
          return {
            ...crypto,
            marketValue,
            value: currentValue,
            gains: (currentValue-crypto.totalSpent)
          };
        });
        setCryptoData(updatedData);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [cryptoMarketRefresh]);

  return null;
};

export default GetCryptoData;
