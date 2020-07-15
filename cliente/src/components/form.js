import React, { useState, useRef, createRef, useEffect } from "react";
import { VerifiedUser, RestoreOutlined } from "@material-ui/icons";
import State from "./state";
import axios from "axios";

const Form = () => {
  const BASE_URL = "http://localhost:1337";
  const traces = [
    "productSerial",
    "engineSerial",
    "brushSerial",
    "motherboardSerial",
    "cableWindingSerial",
  ];

  useEffect(() => {
    const loginUser = async () => {
      const { data } = await axios.post("http://localhost:1337/auth/local", {
        identifier: "user@user.com",
        password: "111505",
      });
      localStorage.setItem("jwt", data.jwt);
    };
    loginUser();
  }, []);

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
    state: {
      id: null,
      state: "",
      stateText: "",
      created_at: "",
      updated_at: "",
    },
  };
  const [trace, setTrace] = useState(initialState);
  const [checkTrace, setCheckTrace] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const checkProductSerialAvaible = async (productSerial) => {
    try {
      let { data } = await axios.get(
        `${BASE_URL}/traces?productSerial_eq=${productSerial}`
      );
      return data;
    } catch (e) {}
  };

  const updateTrace = () => {};

  const submitForm = async (e) => {
    e.preventDefault();

    try {
      let data = await checkProductSerialAvaible(trace.productSerial.trim());
      if (data.length) {
        setCheckTrace(initialState);
        setTrace(initialState);
        setTrace(data[0]);
        setCheckTrace(data[0]);
        setIsLoading(false);
        let { current } = traceRefs;
        current[data[0].state.id].current.focus();
      }
      if (!data.length) {
        try {
          let { data } = await fetch("http://localhost:1337/traces", {
            method: "post",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
            body: JSON.stringify({
              productSerial: trace.productSerial,
              state: 1,
            }),
          });
        } catch (e) {
          console.log(e);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="form-wrapper">
      <State>Yeni Üretim</State>
      <nav>
        <img className="logo" src="/logo.png" alt="Ernataş Logo"></img>
      </nav>
      <form onSubmit={(e) => submitForm(e)}>
        <label>Seri No</label>
        <input
          ref={traceRefs.current[0]}
          onChange={(e) =>
            setTrace({ ...trace, productSerial: e.target.value })
          }
          value={trace.productSerial}
          autoFocus
          type="text"
        />
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
            value={trace.engineSerial}
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
            value={trace.brushSerial}
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
            value={trace.motherboardSerial}
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
            value={trace.cableWindingSerial}
            type="text"
          />
        </div>
        <input type="submit" value="Kaydet" />
      </form>
    </div>
  );
};

export default Form;
