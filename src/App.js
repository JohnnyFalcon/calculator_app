import "./App.css";
import { symbols } from "./symbols";
import { useEffect, useReducer } from "react";
import backgroundImage from "./images/board.jpg";

const initialState = {
  currentExpression: "",
  toggle: true,
  deletedChar: "",
  symbolsDisplay: ["+", "-", "×", "÷"],
  array: [],
  displayExpression: "",
  evaluate: false
};

const reducer = (state, action) => {
  const expressionStr = state.currentExpression.toString();
  const displayStr = state.displayExpression.toString();
  switch (action.type) {
    case "ADD_NUMBER":
      // ---------- Prevent adding dot after symbol ----------
      if (
        state.symbolsDisplay.includes(
          expressionStr.charAt(expressionStr.length - 1)
        ) &&
        action.nextNumber === "."
      )
        return state;

      // ---------- Prevent adding symbol after dot  ----------
      if (
        expressionStr.charAt(expressionStr.length - 1) === "." &&
        state.symbolsDisplay.includes(action.nextNumber)
      )
        return state;

      // ----------  Put '0.' when first digit u put is '.' ----------
      if (expressionStr === "" && action.nextNumber === ".")
        return { ...state, currentExpression: "0.", displayExpression: "0." };
      // ---------- Prevent adding multiple dots next to each other ----------
      if (
        expressionStr.charAt(expressionStr.length - 1) === "." &&
        action.nextNumber === "."
      )
        return state;
      //--------- Prevent adding multiple dots in number ---------

      if (!state.toggle && action.nextNumber === ".") return state;

      //  --------- Prevent adding symbol when expresion is empty ---------
      if (
        expressionStr === "" &&
        state.symbolsDisplay.includes(action.nextNumber)
      )
        return state;
      // --------- Prevent adding multipe zeros on the beginning of teh number ---------

      if (displayStr === "0" && action.nextNumber === 0) return state;

      if (
        displayStr === "0" &&
        !state.symbolsDisplay.includes(action.nextNumber) &&
        action.nextNumber !== "."
      ) {
        const x = expressionStr.slice(0, expressionStr.length - 1);

        return {
          ...state,
          currentExpression: x + action.nextNumber,
          displayExpression: action.nextNumber
        };
      }
      // ---------- Prevent adding multiple operand ----------
      if (
        state.symbolsDisplay.includes(
          expressionStr.charAt(expressionStr.length - 1)
        ) &&
        state.symbolsDisplay.includes(action.nextNumber)
      )
        return state;

      // --------- When pressing another number afterevaluation its clearing result and displaying next choosen number -------

      if (state.evaluate && !state.symbolsDisplay.includes(action.nextNumber))
        return {
          ...state,
          currentExpression: "" + action.nextNumber,
          displayExpression: "" + action.nextNumber,
          evaluate: false
        };

      // --------- After evaluation it's allowing to add operand to result -------

      if (state.evaluate && state.symbolsDisplay.includes(action.nextNumber))
        return {
          ...state,
          currentExpression: expressionStr + action.nextNumber,
          displayExpression: displayStr + action.nextNumber,
          evaluate: false
        };

      return {
        ...state,
        currentExpression: expressionStr + action.nextNumber,
        displayExpression: displayStr + action.nextNumber,
        deletedChar: ""
      };

    case "CLEAR":
      return {
        ...state,
        currentExpression: "",
        displayExpression: "",
        array: [],
        toggle: true
      };

    case "EVALUATE":
      // ------ Prevent evaluating expression if it doesn't contain an operand -------
      // const match = state.symbolsDisplay.find((element) => {
      //   expressionStr.includes(element);
      // });

      // if (!match) return state;
      // ----------- Prevent evaluating expression when symbol is on the end ---------

      if (expressionStr === "") return state;

      if (
        state.symbolsDisplay.includes(
          expressionStr.charAt(expressionStr.length - 1)
        )
      )
        return state;

      // ------ Convert symbols from display version to calcualtion version --------

      const convert1 = expressionStr.replaceAll("×", "*");
      const convert2 = convert1.replaceAll("÷", "/");

      const total = Function("return " + convert2)();

      return {
        ...state,
        currentExpression: total,
        displayExpression: total,
        array: [],
        toogle: true,
        evaluate: true
      };
    case "DELATE":
      const x = expressionStr.slice(0, expressionStr.length - 1);
      const y = expressionStr.slice(
        expressionStr.length - 1,
        expressionStr.length
      );
      const first = displayStr.slice(0, displayStr.length - 1);
      // const second = displayStr.slice(displayStr.length - 1, displayStr.length);

      // -------- After deleting dot change toggle to keep logic when adding antoher numbers ------
      if (state.deletedChar === ".")
        return {
          ...state,
          toggle: true,
          deletedChar: ""
        };

      // ------- Same thing like above ------

      if (state.symbolsDisplay.includes(state.deletedChar))
        return {
          ...state,
          toggle: false,
          deletedChar: ""
        };

      if (expressionStr === "") return state;
      if (expressionStr.length === 0)
        return {
          currentExpression: "",
          displayExpression: ""
        };
      if (displayStr === "") {
        // When display expression is empty we need to get last number from array to keep deleting ------

        const newArray = [...state.array];
        const newCurrent = newArray.pop();
        const convertCurrent = newCurrent.toString().replace(/\s+/g, ""); // We style our output with spaces so we need to join it again to be able to perform deleting correctly
        const x = expressionStr.slice(0, expressionStr.length - 1);
        const first = convertCurrent.slice(0, displayStr.length - 1);

        return {
          ...state,
          array: newArray,
          displayExpression: first,
          currentExpression: x,
          deletedChar: y
        };
      }

      return {
        ...state,
        currentExpression: x,
        displayExpression: first,
        deletedChar: y
      };
    case "TOGGLE":
      if (expressionStr.charAt(expressionStr.length - 1) === ".")
        return { ...state, toggle: action.toggleOn };

      return {
        ...state,
        toggle: action.toggleOn
      };
    case "ADD_TO_ARRAY": // After pressing mathematical sybol, whole part being added to array and style with white spaces
      let parts = displayStr.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      parts.join(".");
      return {
        ...state,
        array: [...state.array, parts.join(".")],
        displayExpression: ""
      };
  }
};

function App() {
  const [
    {
      currentExpression,
      symbolsDisplay,
      deletedChar,
      array,
      displayExpression
    },
    dispatch
  ] = useReducer(reducer, initialState);

  const formatter = (expresion) => {
    // function add white spaces to output
    let parts = expresion.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
  };

  useEffect(() => {
    if (deletedChar === ".")
      return (
        dispatch({ type: "TOGGLE", toggleOn: true }),
        dispatch({ type: "DELATE" })
      );

    if (currentExpression === "")
      return dispatch({ type: "TOGGLE", toggleOn: true });

    if (symbolsDisplay.includes(deletedChar))
      return (
        dispatch({ type: "TOGGLE", toggleOn: false }),
        dispatch({ type: "DELATE" })
      );

    if (
      symbolsDisplay.includes(
        currentExpression.toString().charAt(currentExpression.length - 1)
      ) &&
      deletedChar === ""
    )
      return dispatch({ type: "ADD_TO_ARRAY" });

    console.log(currentExpression);
  }, [currentExpression, deletedChar, symbolsDisplay]);

  useEffect(() => {
    console.log(displayExpression);
    console.log(array);
  }, [displayExpression, array]);

  const handleActions = (value) => {
    switch (value) {
      case "=":
        return dispatch({ type: "EVALUATE" });
      case "DEL":
        return dispatch({ type: "DELATE" });
      case "AC":
        return dispatch({ type: "CLEAR" });
      default:
        return dispatch({ type: "ADD_NUMBER", nextNumber: value });
    }
  };
  const handleToggle = () => {
    if (
      currentExpression.toString().charAt(currentExpression.length - 1) === "."
    )
      return dispatch({ type: "TOGGLE", toggleOn: false });

    if (
      symbolsDisplay.includes(
        currentExpression.toString().charAt(currentExpression.length - 1)
      )
    )
      return dispatch({ type: "TOGGLE", toggleOn: true });
  };

  return (
    <>
      <div>
        <img src={backgroundImage} className="background-img" alt="board"></img>
        <div className="grid">
          <div className="output">
            <div className="current-output">
              {array.join("")}
              {formatter(displayExpression)}
            </div>
          </div>
          {symbols.map((symbol, id) => (
            <button
              key={id}
              className="button-back"
              onClick={() => {
                handleActions(symbol.value);
                handleToggle(symbol.value);
              }}
              style={{
                gridColumn: symbol.span && "span 2",
                background: symbol.back_color
              }}
            >
              <span
                className="button-front"
                style={{
                  backgroundColor: symbol.color
                }}
              >
                {symbol.value}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
