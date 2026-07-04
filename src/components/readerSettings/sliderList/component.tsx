import React from "react";
import { Trans } from "react-i18next";
import { SliderListProps, SliderListState } from "./interface";
import "./sliderList.css";
import { ConfigService } from "../../../assets/lib/kookit-extra-browser.min";
class SliderList extends React.Component<SliderListProps, SliderListState> {
  constructor(props: SliderListProps) {
    super(props);
    this.state = {
      isTyping: false,
      inputValue: "",
      isEntered: false,
      fontSize: ConfigService.getReaderConfig("fontSize") || "17",
      scale: ConfigService.getReaderConfig("scale") || "1",
      letterSpacing: ConfigService.getReaderConfig("letterSpacing") || "0",
      paraSpacing: ConfigService.getReaderConfig("paraSpacing") || "0",
      brightness: ConfigService.getReaderConfig("brightness") || "1",
      margin: ConfigService.getReaderConfig("margin") || "0",
      fontSizeMax: ConfigService.getReaderConfig("fontSizeMax") || "40",
    };
  }

  getConfiguredMinValue = () => {
    const parsedMin = parseFloat(this.props.item.minValue);
    return Number.isNaN(parsedMin) ? 13 : parsedMin;
  };

  getEffectiveMaxValue = () => {
    if (!this.props.item.adjustableMax) {
      return this.props.item.maxValue;
    }
    const parsedMax = parseFloat(this.state.fontSizeMax || "40");
    return Math.max(
      Number.isNaN(parsedMax) ? 40 : parsedMax,
      this.getConfiguredMinValue()
    );
  };

  getEffectiveMinValue = () => {
    return this.getConfiguredMinValue();
  };

  getClampedValue = (rawValue: string) => {
    const parsedValue = parseFloat(rawValue);
    const min = this.getEffectiveMinValue();
    const max = this.getEffectiveMaxValue();

    if (Number.isNaN(parsedValue)) {
      return this.state[this.props.item.mode];
    }

    return Math.min(Math.max(parsedValue, min), max).toString();
  };

  applyValue = (mode: string, nextValue: string) => {
    this.setState({ [mode]: nextValue } as any);
    ConfigService.setReaderConfig(mode, nextValue);

    if (mode === "scale") {
      this.props.handleScale(nextValue);
    }

    if (mode === "margin") {
      this.props.handleMargin(nextValue);
    }
  };

  getClampedFontSizeMax = (rawValue: string) => {
    const parsedValue = parseInt(rawValue, 10);
    if (Number.isNaN(parsedValue)) {
      return this.state.fontSizeMax || "40";
    }
    return Math.max(parsedValue, this.getConfiguredMinValue()).toString();
  };

  applyFontSizeMax = (rawValue: string) => {
    const nextMaxValue = this.getClampedFontSizeMax(rawValue);
    this.setState({ fontSizeMax: nextMaxValue } as any);
    ConfigService.setReaderConfig("fontSizeMax", nextMaxValue);

    if (parseFloat(this.state.fontSize) > parseFloat(nextMaxValue)) {
      this.applyValue("fontSize", nextMaxValue);
    }
  };

  renderMaxValue = () => {
    if (!this.props.item.adjustableMax) {
      return (
        <span className="ultra-large-size" style={{ fontSize: "16px" }}>
          {this.props.item.maxLabel}
        </span>
      );
    }

    return (
      <input
        className="slider-max-value-input"
        value={this.state.fontSizeMax}
        type="number"
        min={this.getConfiguredMinValue()}
        step="1"
        title="Maximum font size"
        onInput={(event: any) => {
          this.setState({ fontSizeMax: event.target.value } as any);
        }}
        onChange={(event: any) => {
          this.setState({ fontSizeMax: event.target.value } as any);
        }}
        onBlur={(event: any) => {
          this.applyFontSizeMax(event.target.value);
          this.handleRest("fontSize");
        }}
        onKeyDown={(event: any) => {
          if (event.key === "Enter") {
            this.applyFontSizeMax(event.target.value);
            this.handleRest("fontSize");
            event.currentTarget.blur();
          }
        }}
      />
    );
  };

  handleRest = async (mode) => {
    this.props.renderBookFunc();
  };
  onValueChange = (event: any, mode: string) => {
    const nextValue = this.getClampedValue(event.target.value);
    event.target.value = nextValue;
    this.setState({ inputValue: nextValue });
    this.applyValue(mode, nextValue);
  };
  onValueInput = (event: any, mode: string) => {
    this.setState({ [mode]: event.target.value } as any);
  };
  updateValueByStep = (step: number, mode: string, direction: 1 | -1) => {
    this.onValueChange(
      {
        target: {
          value: (parseFloat(this.state[mode]) + step * direction).toString(),
        },
      },
      mode
    );
  };
  handleMinus = (step: number, mode: string) => {
    this.updateValueByStep(step, mode, -1);
  };
  handleAdd = (step: number, mode: string) => {
    this.updateValueByStep(step, mode, 1);
  };
  render() {
    return (
      <div className="font-size-setting">
        <div className="font-size-title">
          <span style={{ marginRight: "10px" }}>
            <Trans>{this.props.item.title}</Trans>
          </span>

          <input
            className="input-value"
            value={
              this.state.isTyping
                ? this.state.inputValue
                : this.state[this.props.item.mode]
            }
            type="number"
            step={
              this.props.item.title === "Page width" ||
              this.props.item.title === "Brightness"
                ? "0.1"
                : "1"
            }
            onInput={(event: any) => {
              let fieldVal = event.target.value;
              this.setState({ inputValue: fieldVal });
            }}
            onChange={(event) => {
              let fieldVal = event.target.value;
              this.setState({ inputValue: fieldVal });
            }}
            onFocus={() => {
              this.setState({ isTyping: true });
            }}
            onBlur={(event) => {
              if (!this.state.isEntered) {
                let fieldVal = event.target.value;
                if (!fieldVal) return;
                this.onValueChange(event, this.props.item.mode);
                this.setState({ isTyping: false });
                this.handleRest(this.props.item.mode);
              } else {
                this.setState({ isEntered: false });
              }
            }}
            onKeyDown={(event: any) => {
              if (event.key === "Enter") {
                this.setState({ isEntered: true });
                let fieldVal = event.target.value;
                if (!fieldVal) return;
                this.onValueChange(event, this.props.item.mode);
                this.setState({ isTyping: false });
                this.handleRest(this.props.item.mode);
              }
            }}
          />
          <span style={{ marginLeft: "10px" }}>
            {this.state[this.props.item.mode]}
          </span>
        </div>
        <div className="slider-value-row">
          <span className="ultra-small-size">{this.props.item.minLabel}</span>
          <div className="font-size-selector">
            <input
              className="input-progress"
              value={this.state[this.props.item.mode]}
              type="range"
              max={this.getEffectiveMaxValue()}
              min={this.getEffectiveMinValue()}
              step={this.props.item.step}
              onInput={(event) => {
                this.onValueChange(event, this.props.item.mode);
              }}
              onChange={(event) => {
                this.onValueInput(event, this.props.item.mode);
              }}
              onMouseUp={() => {
                this.handleRest(this.props.item.mode);
              }}
              style={{ position: "absolute", bottom: "11px" }}
            />
          </div>
          {this.renderMaxValue()}
        </div>
      </div>
    );
  }
}

export default SliderList;
