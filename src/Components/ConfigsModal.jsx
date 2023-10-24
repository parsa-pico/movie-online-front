import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ConfigsModal = ({ show, handleClose }) => {
  const [configs, setConfigs] = useState({ fontSize: 0, transparency: 0 });
  function changeConfig(key, value) {
    setConfigs({ ...configs, [key]: value });
  }
  function setInitalSubtitle() {
    const element = document.getElementById("caption-text");
    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(
      computedStyle.getPropertyValue("font-size").split("px")[0]
    );
    const captionWrapper = document.getElementsByClassName("caption")[0];
    const computedStyleCaption = window.getComputedStyle(captionWrapper);
    let transparency =
      computedStyleCaption.getPropertyValue("background-color");
    transparency = parseFloat(transparency.match(/[\d\.]+/g)[3] || 1);

    setConfigs({ ...configs, fontSize, transparency });
  }
  useEffect(() => {
    setInitalSubtitle();
  }, [show]);

  function setNewFontSize(size) {
    const element = document.getElementById("caption-text");

    element.style.fontSize = size.toString() + "px";
    changeConfig("fontSize", parseFloat(size));
  }

  function setTransparency(alpha) {
    alpha = parseFloat(alpha.toFixed(2));
    const element = document.getElementsByClassName("caption")[0];
    console.log(alpha);
    element.style.backgroundColor = `rgba(0, 0, 0, ${alpha})`;
    changeConfig("transparency", alpha);
  }
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>تنظیمات </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="flex-row">
          <div className="flex-col">
            <div className="flex-row">
              <Button onClick={() => setNewFontSize(configs.fontSize - 1)}>
                -
              </Button>
              <input
                min={2}
                max={90}
                onChange={(e) => {
                  const { value } = e.target;
                  if (value < 90) setNewFontSize(value);
                }}
                value={configs.fontSize}
                type="number"
                className="form-control "
              />
              <Button onClick={() => setNewFontSize(configs.fontSize + 1)}>
                +
              </Button>
            </div>
            <div className="flex-row mt-2">
              <Button
                onClick={() => {
                  let alpha = configs.transparency - 0.1;
                  if (alpha <= 0) alpha = 0;
                  setTransparency(alpha);
                }}
              >
                -
              </Button>
              <input
                onChange={(e) => {
                  const { value } = e.target;
                  if (value <= 1) setTransparency(value);
                }}
                min={0}
                max={1}
                step={0.1}
                value={configs.transparency}
                type="number"
                className="form-control "
              />
              <Button
                onClick={() => {
                  let alpha = configs.transparency + 0.1;
                  if (alpha >= 1) alpha = 1;
                  setTransparency(alpha);
                }}
              >
                +
              </Button>
            </div>
          </div>
          <div className="flex-col" style={{ direction: "rtl" }}>
            <p> اندازه زیرنویس </p>
            <p className="mt-2">شفافیت پشت زمینه زیرنویس </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          بستن
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfigsModal;
