import React, { useState } from "react";
import { Tooltip } from "react-bootstrap";
import { NoCallBackErr } from "../socket";
export function RadioButton({ id, name, label, error, ...rest }) {
  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="radio"
        name={name}
        id={id}
        {...rest}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
      {error && <p>{error}</p>}
    </div>
  );
}
export function checkBox({ id, className, ...rest }) {
  return (
    <div class="form-check">
      <input
        className={"form-check-input" + className}
        type="checkbox"
        {...rest}
        id={id}
      />
      <label class="form-check-label" for={id}>
        id
      </label>
    </div>
  );
}
export function Input({
  id,
  placeholder,
  className,
  type = " text",
  error,
  ...rest
}) {
  return (
    <span className="my-input">
      {!placeholder && <label htmlFor={id}>{id}</label>}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...rest}
        className={"form-control " + className}
      />
      {error && (
        <div className="alert alert-danger">
          <b>{error}</b>
        </div>
      )}
    </span>
  );
}

export const ClickButton = ({ onClick, children, ...rest }) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const handleClick = async () => {
    setIsDisabled(true);

    try {
      await onClick();
    } catch (e) {
      if (e instanceof NoCallBackErr) return;
      if (e && e.response) {
        const expectedError =
          e.response && e.response.status >= 400 && e.response.status < 500;

        if (expectedError) alert(e.response.data);
      } else alert(e.message);
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={isDisabled} {...rest}>
      {children}
    </button>
  );
};
export function simpleToolTip(id, text) {
  return <Tooltip id={id}>{text}</Tooltip>;
}
