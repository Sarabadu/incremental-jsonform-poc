import React, { useState } from "react";
import { JsonForms } from "@jsonforms/react";
import logo from "./logo.svg";
import "./App.css";
import { person } from "@jsonforms/examples";
import {
  materialRenderers,
  materialCells,
  Unwrapped,
} from "@jsonforms/material-renderers";
import schemasConfig from "./schemaenum.json";
import uischema from "./ui-schema3.json";
import { Grid } from "@mui/material";
import { JsonSchema7, getData, createAjv } from "@jsonforms/core";
import jp from "jsonpath";
import CustomEnumArrayRenderer, {
  customEnumArrayRendererTester,
} from "./CustomEnumArrayRenderer";

const initialData = person.data;

const schemas = schemasConfig.steps;
const relations = schemasConfig.relations;

const uischemas = [
  {
    type: "VerticalLayout",
    elements: [
      {
        type: "VerticalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/categories",
          },
        ],
      },
    ],
  },
  {
    type: "ListWithDetail",
    scope: "#/properties/categories",
    options: {
      detail: {
        type: "VerticalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/subcategories",
            label: "Subcategories",
          },
        ],
      },
    },
  },
  {
    type: "ListWithDetail",
    scope: "#/properties/categories",
    options: {
      detail: {
        type: "VerticalLayout",
        elements: [
          {
            type: "ListWithDetail",
            scope: "#/properties/subcategories",
            label: "Subcategories",
            options: {
              detail: {
                type: "VerticalLayout",
                elements: [
                  {
                    type: "Control",
                    scope: "#/properties/types",
                    label: "Types",
                  },
                ],
              },
            },
          },
        ],
      },
    },
  },
];

// const buildEnums = (schema: any, relations: any, data: any) => {
//   const newSchema = { ...schema };
//   const properties = newSchema.properties;
//   for (const key in properties) {
//     const property = properties[key];
//     // if (property.type === "string") {
//     //   const relation = relations.find((r: any) => r.name === property.enum);
//     //   if (relation) {
//     //     property.enum = relation.values;
//     //   }
//     // }
//     if (property.type === "array") {
//       if (property.filterBy && data) {
//         const filterBy = property.filterBy.in;
//         const filterByValue = jp.query(data, filterBy);

//         if (filterByValue.length) {
//           const oneof = property.items.oneOf.filter((o: any) => {
//             return filterByValue.includes(o.const[property.filterBy.property]);
//           });

//           property.items.oneOf = oneof;
//         }
//       }
//       buildEnums(property.items, relations, data);
//     }
//   }

//   return newSchema;
// };
// const {MaterialOneOfEnumControl} = Unwrapped;
// c

function App() {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  return (
    <>
      <div className="App">
        <Grid m={15}>
          {schemas.map((schema, index) => {
            return (
              <>
                {" "}
                New From starts here
                <JsonForms
                  schema={schema as unknown as JsonSchema7}
                  uischema={uischemas[index]}
                  data={data}
                  // ajv={createAjv({ removeAdditional: true })}
                  renderers={[
                    ...materialRenderers,
                    {
                      tester: customEnumArrayRendererTester,
                      renderer: CustomEnumArrayRenderer,
                    },
                  ]}
                  cells={materialCells}
                  onChange={({ data, errors }) => {
                    setData(data);
                    errors && setErrors(errors);
                  }}
                />
                {/* <Grid m={15}>
                  {JSON.stringify(buildEnums(schema, relations, data), null, 2)}
                </Grid> */}
              </>
            );
          })}
        </Grid>
      </div>
      <pre>data:{JSON.stringify(data, null, 2)}</pre>
      <Grid m={15}>
        <ul>
          {errors &&
            (errors as any).length > 0 &&
            (errors as any).map((e: any, i: number) => {
              return (
                <li key={i}>
                  Error {e.message} <pre>{JSON.stringify(e, null, 2)}</pre>
                </li>
              );
            })}
        </ul>
      </Grid>
    </>
  );
}

export default App;
