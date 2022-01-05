import { useEffect, useState } from "react";
import type { ReactNode, ReactElement } from "react";
import { Button, Stack } from ".";

interface TabProps {
  header?: string;
  children: ReactNode;
}

interface Props {
  activeIndex?: number;
  activeHeader?: string;
  headless?: boolean;
  children: ReactElement<TabProps>[];
}

export const Tab = (props: TabProps) => null;

export const Tabs = ({ children, activeIndex, activeHeader, headless }: Props) => {
  const [active, setActive] = useState(activeIndex || 0);
  const tabProps: TabProps[] = children.map(elem => elem.props);

  useEffect(() => {
    if (activeIndex) setActive(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    if (activeHeader) {
      const idx = tabProps.findIndex(tab => tab.header === activeHeader);
      setActive(idx);
    }
  }, [activeHeader, tabProps]);

  return (
    <>
      {!headless && (
        <Stack
          css={{
            gap: "$3",
            flex: 1,
            flexWrap: "nowrap",
            marginBottom: "-1px",
          }}
        >
          {tabProps.map((prop, idx) => (
            <Button
              key={prop.header}
              role="tab"
              tabIndex={idx}
              onClick={() => setActive(idx)}
              onKeyPress={() => setActive(idx)}
              outline={active !== idx}
              size="sm"
              css={{
                "&:hover": {
                  span: {
                    visibility: "visible",
                  },
                },
              }}
            >
              {prop.header || idx}
            </Button>
          ))}
        </Stack>
      )}
      {tabProps[active].children}
    </>
  );
};
