import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadCrypto } from "../../../state/cryptoSlice";

// Invisible fetch-on-mount component (matches Polyglot's GetUser.jsx
// pattern) - mounted globally in App.js so crypto holdings + live market
// data are available everywhere (e.g. Home.js's crypto summary card) without
// needing the user to visit /investments first.
const GetCryptoData = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadCrypto());
  }, [dispatch]);

  return null;
};

export default GetCryptoData;
