export const extractSchemaProps = <O extends object>(obj: O) => 
    Object.entries(obj).reduce((prev, [key, val]) => {
        const typeOf = <T>(arg: T) =>
            arg instanceof Array
                ? "array"
                : arg === null
                    ? "undefined"
                    : typeof arg;

        const value = (typeOf(val) === "object" && '$type' in val && '$value' in val) ? val?.$value : val;
        const type = typeOf(value);

        let schema: any = {
            title: key,
            type,
            default: value,
        }

        if (typeOf(value) === 'array') {
            const item = value[0] // TODO merge other item schema's into one
            if (typeOf(item) !== 'object') {
                schema.items = {
                    type: 'object',
                    properties: extractSchemaProps(item),
                    default: item
                }
            }
            // TODO support primitive-value arrays
        }

        if (typeOf(value) === "object") {
            schema.properties = extractSchemaProps(value)
        }
        return {
            ...prev,
            [key]: schema,
        };
    }, {} as any);

