import { forwardRef } from 'react'
import { mauve, mauveDark, purple, purpleDark } from '@radix-ui/colors'
import { useTheme } from 'next-themes'
import { styled } from '../stitches.config'
import dynamic from 'next/dynamic'
import type { Props, StylesConfig } from 'react-select'
const SelectInput = dynamic(() => import('react-select'), { ssr: false })
const CreatableSelectInput = dynamic(() => import('react-select/creatable'), { ssr: false })

const getColors = (isDark: boolean) => {
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
    placeholder: isDark ? mauveDark.mauve11 : mauve.mauve11
  }
  colors.outline = colors.background
  colors.selected = colors.secondary
  return colors
}

const getStyles = (isDark: boolean) => {
  const colors = getColors(isDark)
  const styles: StylesConfig = {
    container: provided => {
      return {
        ...provided,
        position: 'relative',
        width: '100%'
      }
    },
    singleValue: provided => ({
      ...provided,
      color: colors.mauve12
    }),
    menu: provided => ({
      ...provided,
      backgroundColor: colors.dropDownBg
    }),
    control: (provided, state) => {
      return {
        ...provided,
        minHeight: 0,
        border: '0px',
        backgroundColor: colors.mauve4,
        boxShadow: `0 0 0 1px ${state.isFocused ? colors.border : colors.secondary}`
      }
    },
    input: provided => {
      return {
        ...provided,
        color: '$text'
      }
    },
    multiValue: provided => {
      return {
        ...provided,
        backgroundColor: colors.mauve8
      }
    },
    multiValueLabel: provided => {
      return {
        ...provided,
        color: colors.mauve12
      }
    },
    multiValueRemove: provided => {
      return {
        ...provided,
        ':hover': {
          background: colors.mauve9
        }
      }
    },
    option: (provided, state) => {
      return {
        ...provided,
        color: colors.searchText,
        backgroundColor: state.isFocused ? colors.activeLight : colors.dropDownBg,
        ':hover': {
          backgroundColor: colors.active,
          color: '#ffffff'
        },
        ':selected': {
          backgroundColor: 'red'
        }
      }
    },
    indicatorSeparator: provided => {
      return {
        ...provided,
        backgroundColor: colors.secondary
      }
    },
    dropdownIndicator: (provided, state) => {
      return {
        ...provided,
        padding: 6,
        color: state.isFocused ? colors.border : colors.secondary,
        ':hover': {
          color: colors.border
        }
      }
    },
    clearIndicator: provided => {
      return {
        ...provided,
        padding: 6,
        color: colors.secondary,
        ':hover': {
          color: colors.border
        }
      }
    }
  }
  return styles
}

// eslint-disable-next-line react/display-name
const Select = forwardRef<any, Props>((props, ref) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const styles = getStyles(isDark)
  return (
    <SelectInput
      ref={ref}
      menuPosition={props.menuPosition || 'fixed'}
      styles={styles}
      {...props}
    />
  )
})

// eslint-disable-next-line react/display-name
const Creatable = forwardRef<any, Props>((props, ref) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const styles = getStyles(isDark)
  return (
    <CreatableSelectInput
      ref={ref}
      formatCreateLabel={label => `Enter "${label}"`}
      menuPosition={props.menuPosition || 'fixed'}
      styles={styles}
      {...props}
    />
  )
})

export default styled(Select, {})
export const CreatableSelect = styled(Creatable, {})
