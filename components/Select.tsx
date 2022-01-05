import { FC } from "react";
import { gray, grayDark } from "@radix-ui/colors";
import { useTheme } from "next-themes";
import { styled } from '../stitches.config';
import dynamic from 'next/dynamic';
import type { Props } from "react-select";
const SelectInput = dynamic(() => import("react-select"), { ssr: false });

const Select: FC<Props> = props => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors: any = {
    // primary: pink.pink9,
    primary: isDark ? grayDark.gray4 : gray.gray4,
    secondary: isDark ? grayDark.gray8 : gray.gray8,
    background: isDark ? "rgb(10, 10, 10)" : "rgb(245, 245, 245)",
    searchText: isDark ? grayDark.gray12 : gray.gray12,
    placeholder: isDark ? grayDark.gray11 : gray.gray11,
  };
  colors.outline = colors.background;
  colors.selected = colors.secondary;
  return (
    <SelectInput
      theme={theme => ({
        ...theme,
        spacing: {
          ...theme.spacing,
          controlHeight: 30
        },
        colors: {
          primary: colors.selected,
          primary25: colors.primary,
          primary50: colors.primary,
          primary75: colors.primary,
          danger: colors.primary,
          dangerLight: colors.primary,
          neutral0: colors.background,
          neutral5: colors.primary,
          neutral10: colors.primary,
          neutral20: colors.outline,
          neutral30: colors.primary,
          neutral40: colors.primary,
          neutral50: colors.placeholder,
          neutral60: colors.primary,
          neutral70: colors.primary,
          neutral80: colors.searchText,
          neutral90: colors.primary,
        },
      })}
      {...props}
    />
  );
};

export default styled(Select, {});
