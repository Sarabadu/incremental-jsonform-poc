import {
  and,
  ControlProps,
  DispatchPropsOfMultiEnumControl,
  hasType,
  JsonSchema,
  OwnPropsOfEnum,
  Paths,
  resolveData,
  RankedTester,
  rankWith,
  schemaMatches,
  schemaSubPathMatches,
  uiTypeIs,
} from "@jsonforms/core";
import { MuiCheckbox } from "@jsonforms/material-renderers";

import { withJsonFormsMultiEnumProps, useJsonForms } from "@jsonforms/react";

import {
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Hidden,
} from "@mui/material";
import isEmpty from "lodash/isEmpty";
import React from "react";

export const CustomEnumArrayRenderer = ({
  schema,
  visible,
  errors,
  path,
  options,
  data,
  addItem,
  removeItem,
  handleChange,
  ...otherProps
}: ControlProps & OwnPropsOfEnum & DispatchPropsOfMultiEnumControl) => {
  const { core } = useJsonForms();
  const filteredOptions = (
    schema as JsonSchema & { filterBy: { parent: string } }
  ).filterBy?.parent
    ? options?.filter((option: any) => {
        const parentPath = path.split(".").slice(0, -1).join(".");
        const parentData = resolveData(core?.data, parentPath);
        const parentPropName = (
          schema as JsonSchema & { filterBy: { parent: string } }
        ).filterBy?.parent;

        return option.value[parentPropName] === parentData[parentPropName];
      })
    : options;
  return (
    <Hidden xlUp={!visible}>
      <FormControl component="fieldset">
        <FormGroup row>
          {filteredOptions?.map((option: any, index: number) => {
            const optionPath = Paths.compose(path, `${index}`);
            const checkboxValue = data?.some(
              (d: { key: any }) =>
                d === option.value || d.key === option.value.key
            )
              ? option.value
              : undefined;
            return (
              <FormControlLabel
                id={option.value}
                key={option.value}
                control={
                  <MuiCheckbox
                    key={"checkbox-" + option.value}
                    isValid={isEmpty(errors)}
                    path={optionPath}
                    handleChange={(_childPath: any, newValue: any) =>
                      newValue
                        ? addItem(path, option.value)
                        : removeItem?.(path, option.value)
                    }
                    data={checkboxValue}
                    errors={errors}
                    schema={schema}
                    visible={visible}
                    {...otherProps}
                  />
                }
                label={option.label}
              />
            );
          })}
        </FormGroup>
        <FormHelperText error>{errors}</FormHelperText>
      </FormControl>
    </Hidden>
  );
};

const hasOneOfItems = (schema: JsonSchema): boolean =>
  schema.oneOf !== undefined &&
  schema.oneOf.length > 0 &&
  (schema.oneOf as JsonSchema[]).every((entry: JsonSchema) => {
    return entry.const !== undefined;
  });

const hasEnumItems = (schema: JsonSchema): boolean =>
  schema.type === "string" && schema.enum !== undefined;

export const customEnumArrayRendererTester: RankedTester = rankWith(
  7,
  and(
    uiTypeIs("Control"),
    and(
      schemaMatches(
        (schema) =>
          hasType(schema, "array") &&
          !Array.isArray(schema.items) &&
          schema.uniqueItems === true
      ),
      schemaSubPathMatches("items", (schema) => {
        return hasOneOfItems(schema) || hasEnumItems(schema);
      })
    )
  )
);

export default withJsonFormsMultiEnumProps(CustomEnumArrayRenderer);
