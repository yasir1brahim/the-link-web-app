import React from 'react';
import { Label, FormGroup } from 'reactstrap';
// import cx from 'classnames';
// import infoIcon from '../../commons/images/info-button.png';
import MaskedInputField from 'react-text-mask';

export const MaskedInput = (props) => {
  const {
    type,
    value,
    onChange,
    label,
    disabled,
    error,
    className,
    labelClass,
    mask,
    name,
    defaultValue,
  } = props;
  // const [focused, setFocused] = useState(false);
  return (
    <>
      <FormGroup className={className}>
        <MaskedInputField
          type={type || 'text'}
          // className={cx('form-control', {
          //   'field-focus': focused || !!value,
          // })}
          defaultValue={defaultValue}
          disabled={disabled}
          mask={mask}
          name={name}
          value={value}
          guide={false}
          onChange={onChange}
          // onFocus={() => setFocused(true)}
          // onBlur={() => setFocused(false)}
          defaultChecked={defaultValue}
        />
        <Label className={labelClass}>{label}</Label>
        {/* {props.showInfoIcon ? (
          <img src={infoIcon} alt="Info Icon" className="tooltip-icon" />
        ) : null} */}
      </FormGroup>
      {error ? (
        <div className="form-error" style={{ color: 'red', fontSize: '10px' }}>
          {error}
        </div>
      ) : null}
    </>
  );
};
