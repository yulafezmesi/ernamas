import React, { useState, useRef, createRef } from "react";
import { ClearOutlined } from "@material-ui/icons";
import State from "./state";

const Form = () => {
  const BASE_URL = "http://localhost:1337";
  const traces = [
    "productSerial",
    "engineSerial",
    "brushSerial",
    "motherboardSerial",
    "cableWindingSerial",
  ];

  const traceRefs = useRef(traces.map(() => createRef()));
  const initialState = {
    id: null,
    productSerial: "",
    engineSerial: "",
    motherboardSerial: "",
    cableWindingSerial: "",
    brushSerial: "",
    created_at: "",
    updated_at: "",
    state: 1,
  };
  const [trace, setTrace] = useState(initialState);
  const [checkTrace, setCheckTrace] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);

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
      setCheckTrace(initialState);
      setTrace(initialState);
      setTrace(data[0]);
      setCheckTrace(data[0]);
      setIsLoading(false);
      setFocus(data[0].state.id);
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
    console.log(+trace.state.id);
    try {
      let fetched = await fetch(`${BASE_URL}/traces/${+trace.id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          productSerial: trace.productSerial,
          engineSerial: trace.engineSerial,
          motherboardSerial: trace.motherboardSerial,
          cableWindingSerial: trace.cableWindingSerial,
          brushSerial: trace.brushSerial,
          state: +trace.state.id + 1,
        }),
      });
      let data = await fetched.json();
    } catch (e) {
      alert(e);
    }
  };

  const addTrace = async () => {
    try {
      await fetch(`${BASE_URL}/traces`, {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          productSerial: trace.productSerial,
          state: 1,
        }),
      });
    } catch (e) {
      alert(e);
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!trace.productSerial) return;
    if (isLoading) {
      try {
        let data = await getTraceByProductandSetTraces(); //also set isLoading false
        if (!data.length) {
          await addTrace(); //Adding trace
          await getTraceByProductandSetTraces(); //Getting items to added trace
          setFocus(1); //Focusing next ref
        }
      } catch (e) {
        alert(e);
      }
    } else {
      try {
        await updateTraceByProduct();
        let data = await getTraceByProductandSetTraces(); //Getting items to added trace
      } catch (e) {
        alert(e);
      }
    }
  };

  const resetState = () => {
    setIsLoading(!isLoading);
    setTrace(initialState);
    setCheckTrace(initialState);
    setFocus(0);
  };
  return (
    <div className="form-wrapper">
      {/* <State>Yeni Üretim</State> */}
      <nav>
        <img className="logo" src="/logo.png" alt="Ernataş Logo"></img>
      </nav>
      <form onSubmit={(e) => submitForm(e)}>
        <label>Seri No</label>
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
        <label>Motor Seri No</label>
        <div className="input-wrapper">
          <input
            ref={traceRefs.current[1]}
            disabled={
              checkTrace.engineSerial || trace.state.state !== "engineSerial"
            }
            onChange={(e) =>
              setTrace({ ...trace, engineSerial: e.target.value })
            }
            value={trace.engineSerial || ""}
            type="text"
          />
        </div>
        <label>Fırça Seri No</label>
        <div className="input-wrapper">
          <input
            ref={traceRefs.current[2]}
            disabled={
              checkTrace.brushSerial || trace.state.state !== "brushSerial"
            }
            onChange={(e) =>
              setTrace({ ...trace, brushSerial: e.target.value })
            }
            value={trace.brushSerial || ""}
            type="text"
          />
        </div>
        <label>Elektronik Kart Seri No</label>
        <div className="input-wrapper">
          <input
            ref={traceRefs.current[3]}
            disabled={
              checkTrace.motherboardSerial ||
              trace.state.state !== "motherboardSerial"
            }
            onChange={(e) =>
              setTrace({ ...trace, motherboardSerial: e.target.value })
            }
            value={trace.motherboardSerial || ""}
            type="text"
          />
        </div>

        <label>Kablo Sarıcı</label>
        <div className="input-wrapper">
          <input
            ref={traceRefs.current[4]}
            disabled={
              checkTrace.cableWindingSerial ||
              trace.state.state !== "cableWindingSerial"
            }
            onChange={(e) =>
              setTrace({ ...trace, cableWindingSerial: e.target.value })
            }
            value={trace.cableWindingSerial || ""}
            type="text"
          />
        </div>
        <input type="submit" value="Kaydet" />
      </form>
    </div>
  );
};

export default Form;
