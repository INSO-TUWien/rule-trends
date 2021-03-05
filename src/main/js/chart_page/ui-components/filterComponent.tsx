import React from 'react';
import Select from 'react-select';
import { Rule } from '../models/rule';
import { customLog } from '../util/helper';

interface FilterComponentProps {
  rules: Rule[];
  onRuleSelectChange: (selectedOptions: any) => void;
}

interface FilterComponentState {
  selectedOptions: { label: string; value: string }[];
}

/**
 * Component responsible for rendering and event handling of
 * mutli-select rule filter
 */
export class FilterComponent extends React.Component<
  FilterComponentProps,
  FilterComponentState
> {
  /**
   * Initializes FilterComponent
   * @param {Readonly<FilterComponentProps>} props
   */
  constructor(props: Readonly<FilterComponentProps>) {
    super(props);

    this.onMultiSelect = this.onMultiSelect.bind(this);
    this.clearMultiSelect = this.clearMultiSelect.bind(this);

    this.state = {
      selectedOptions: [],
    };
  }

  /**
   * Helper method for clearing multi select
   */
  clearMultiSelect() {
    this.props.onRuleSelectChange([]);
    this.setState({ selectedOptions: [] });
  }

  /**
   * Callback method which is called when changes were made in multi select
   * @param {{ label: string, value: string }[]} selectedOptions
   */
  onMultiSelect(selectedOptions: { label: string; value: string }[]) {
    const selectedRuleKeys = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    customLog('selected option: ', selectedOptions);

    this.props.onRuleSelectChange(selectedRuleKeys);
    this.setState({ selectedOptions: selectedOptions ? selectedOptions : [] });
  }

  /**
   * Helper method for transforming rule data into format
   * suitable for react-select
   * @return {{label: string, value: string}}
   */
  getRuleObjectsForMultiSelect() {
    // needs to be in format
    // [ { label: xx, value: xx } ]

    return this.props.rules.map((i) => {
      return { label: `[${i.key}] ${i.name}`, value: i.key };
    });
  }

  /**
   * Method responsible for rendering multi-select
   * @return {React.ReactNode}
   */
  render() {
    return (
      <Select
        className={'ruleMultiSelect'}
        value={this.state.selectedOptions}
        onChange={this.onMultiSelect}
        options={this.getRuleObjectsForMultiSelect()}
        isMulti={true}
        placeholder={'Select specific rules'}
        styles={{
          control: (base) => ({
            ...base,
            '&:hover': { borderColor: 'lightgray' },
            borderColor: 'lightgray',
            borderWidth: 1,
            boxShadow: 'none',
          }),
        }}
        clearValue={this.clearMultiSelect}
      />
    );
  }
}
