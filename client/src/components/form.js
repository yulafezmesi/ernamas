import React, { useState, useRef, createRef, useEffect } from "react";
import { ClearOutlined } from "@material-ui/icons";

const Form = () => {
  const BASE_URL = "http://localhost:1337";
  const initialState = {
    productSerial: "",
    serial: "",
  };
  const [trace, setTrace] = useState(initialState);
  const [previousTrace, setPreviousTrace] = useState(initialState);
  const [states, setStates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTraceLoading, setTraceLoading] = useState(true);
  const traceRefs = useRef([1, 2].map(() => createRef()));
  useEffect(() => {
    const getStates = async () => {
      try {
        let fetched = await fetch(`${BASE_URL}/states`);
        let data = await fetched.json();
        setStates(data);
        setIsLoading(false);
      } catch (e) {}
    };
    getStates();
  }, []);
  const checkProductSerialAvaible = async (productSerial) => {
    try {
      let fetched = await fetch(
        `${BASE_URL}/traces?productSerial_eq=${productSerial}`
      );
      let data = await fetched.json();
      return data;
    } catch (e) {}
  };

  const getTraceByProductandSetTraces = async () => {
    let data = await checkProductSerialAvaible(trace.productSerial.trim());
    if (data.length) {
      setTrace(initialState);
      setTrace(data[0]);
      setPreviousTrace(data[0]);
      setTraceLoading(false);
    }
    return data;
  };

  const setFocus = (index) => {
    if (index <= 4) {
      let { current } = traceRefs;
      current[index].current.focus();
    }
  };

  const updateTraceByProduct = async () => {
    if (!trace.serial) return;
    let { state } = states.find((item) => trace.serial.endsWith(item.endsWith));
    if (trace[state] && previousTrace[state] !== trace.serial) {
      //If serial exist, add log to reworks table
      await addLogToRework(
        previousTrace[state],
        trace.serial,
        state,
        trace.productSerial
      );
    }
    let updateObj = { [state]: trace.serial };
    try {
      await fetch(`${BASE_URL}/traces/${+trace.id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(updateObj),
      });
      setTrace(initialState); //Reset traces
      setTraceLoading(true);
      setFocus(0); // Focus on productSerial
    } catch (e) {
      alert(e);
    }
  };
  const addTrace = async () => {
    let { state } = states.find((item) =>
      trace.productSerial.endsWith(item.endsWith)
    ); // Check; which property should be update.
    if (state !== "productSerial") {
      //Check productSerial regEx
      alert("Ürün Kodu Geçersiz");
      setTrace({ productSerial: "" });
      setFocus(0);
      return;
    }
    try {
      let data = await fetch(`${BASE_URL}/traces`, {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          productSerial: trace.productSerial,
        }),
      });
      let { id } = await data.json();
      setTrace({ ...trace, id });
      setFocus(1); //Focusing next ref
    } catch (e) {
      alert(e);
    }
  };

  const addLogToRework = async (old_value, new_value, type, productSerial) => {
    debugger;
    try {
      await fetch(`${BASE_URL}/reworks`, {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          productSerial,
          old_value,
          new_value,
          type,
        }),
      });
    } catch (e) {
      alert(e);
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!trace.productSerial) return;
    try {
      if (isTraceLoading) {
        let data = await getTraceByProductandSetTraces(); //also set isLoading false
        if (!data.length) await addTrace();
        else {
          setFocus(1);
          return;
        }
      }
      await updateTraceByProduct();
    } catch (e) {
      alert(e);
    }
  };

  const resetState = () => {
    setTrace(initialState);
    setFocus(0);
  };
  return (
    <div className="form-wrapper">
      {/* <State>Yeni Üretim</State> */}
      <nav>
        <img className="logo" src="/logo.png" alt="Ernataş Logo"></img>
      </nav>
      {!isLoading ? (
        <form onSubmit={(e) => submitForm(e)}>
          <label>Ürün No</label>
          <div className="input-wrapper">
            <input
              ref={traceRefs.current[0]}
              onChange={(e) =>
                setTrace({ ...trace, productSerial: e.target.value })
              }
              value={trace.productSerial || ""}
              autoFocus
              type="text"
            />
            <ClearOutlined
              onClick={() => resetState()}
              style={{
                position: "absolute",
                right: 12,
                color: "var(--danger)",
              }}
            ></ClearOutlined>
          </div>
          <label>Seri No</label>
          <div className="input-wrapper">
            <input
              ref={traceRefs.current[1]}
              onChange={(e) => setTrace({ ...trace, serial: e.target.value })}
              value={trace.serial || ""}
              type="text"
            />
          </div>
          <input type="submit" value="Kaydet" />
        </form>
      ) : null}
    </div>
  );
};

export default Form;
