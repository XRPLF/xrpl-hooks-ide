import { forwardRef } from "react";
import { mauve, mauveDark, purple, purpleDark } from "@radix-ui/colors";
import { useTheme } from "next-themes";
import { styled } from "../stitches.config";
import dynamic from "next/dynamic";
import type { Props } from "react-select";
const SelectInput = dynamic(() => import("react-select"), { ssr: false });

// eslint-disable-next-line react/display-name
const Select = forwardRef<any, Props>((props, ref) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors: any = {
    // primary: pink.pink9,
    active: isDark ? purpleDark.purple9 : purple.purple9,
    activeLight: isDark ? purpleDark.purple5 : purple.purple5,
    primary: isDark ? mauveDark.mauve4 : mauve.mauve4,
    secondary: isDark ? mauveDark.mauve8 : mauve.mauve8,
    background: isDark ? mauveDark.mauve4 : mauve.mauve4,
    searchText: isDark ? mauveDark.mauve12 : mauve.mauve12,
    bg: isDark ? mauveDark.mauve1 : mauve.mauve1,
    dropDownBg: isDark ? mauveDark.mauve5 : mauve.mauve2,
    mauve4: isDark ? mauveDark.mauve4 : mauve.mauve4,
    mauve5: isDark ? mauveDark.mauve5 : mauve.mauve5,
    mauve8: isDark ? mauveDark.mauve8 : mauve.mauve8,
    mauve9: isDark ? mauveDark.mauve9 : mauve.mauve9,
    mauve12: isDark ? mauveDark.mauve12 : mauve.mauve12,
    border: isDark ? mauveDark.mauve10 : mauve.mauve10,
    placeholder: isDark ? mauveDark.mauve11 : mauve.mauve11,
  };
  colors.outline = colors.background;
  colors.selected = colors.secondary;
  return (
    <SelectInput
      ref={ref}
      menuPosition={props.menuPosition || "fixed"}
      styles={{
        container: (provided) => {
          return {
            ...provided,
          };
        },
        singleValue: (provided) => ({
          ...provided,
          color: colors.mauve12,
        }),
        menu: (provided) => ({
          ...provided,
          backgroundColor: colors.dropDownBg,
        }),
        control: (provided, state) => {
          return {
            ...provided,
            border: "0px",
            backgroundColor: colors.mauve4,
            boxShadow: `0 0 0 1px ${
              state.isFocused ? colors.border : colors.secondary
            }`,
          };
        },
        multiValue: (provided) => {
          return {
            ...provided,
            backgroundColor: colors.mauve8,
          };
        },
        multiValueLabel: (provided) => {
          return {
            ...provided,
            color: colors.mauve12,
          };
        },
        multiValueRemove: (provided) => {
          return {
            ...provided,
            ":hover": {
              background: colors.mauve9,
            },
          };
        },
        option: (provided, state) => {
          return {
            ...provided,
            color: colors.searchText,
            backgroundColor: state.isSelected
              ? colors.activeLight
              : colors.dropDownBg,
            ":hover": {
              backgroundColor: colors.active,
              color: "#ffffff",
            },
            ":selected": {
              backgroundColor: "red",
            },
          };
        },
        indicatorSeparator: (provided) => {
          return {
            ...provided,
            backgroundColor: colors.secondary,
          };
        },
        dropdownIndicator: (provided, state) => {
          return {
            ...provided,
            color: state.isFocused ? colors.border : colors.secondary,
            ":hover": {
              color: colors.border,
            },
          };
        },
      }}
      // theme={(theme) => ({
      //   ...theme,
      //   spacing: {
      //     ...theme.spacing,
      //     controlHeight: 30,
      //   },
      //   colors: {
      //     primary: colors.selected,
      //     primary25: colors.active,
      //     primary50: colors.primary,
      //     primary75: colors.primary,
      //     danger: colors.primary,
      //     dangerLight: colors.primary,
      //     neutral0: colors.background,
      //     neutral5: colors.primary,
      //     neutral10: colors.primary,
      //     neutral20: colors.outline,
      //     neutral30: colors.primary,
      //     neutral40: colors.primary,
      //     neutral50: colors.placeholder,
      //     neutral60: colors.primary,
      //     neutral70: colors.primary,
      //     neutral80: colors.searchText,
      //     neutral90: colors.primary,
      //   },
      // })}
      {...props}
    />
  );
});

export default styled(Select, {});
