import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import Container from '../Container'
import Flex from '../Flex'
import Input from '../Input'
import Select from '../Select'
import Text from '../Text'
import {
  SelectOption,
  TransactionState,
  transactionsOptions,
  TxFields,
  getTxFields,
  defaultTransactionType
} from '../../state/transactions'
import { useSnapshot } from 'valtio'
import state from '../../state'
import { streamState } from '../DebugStream'
import { Button } from '..'
import Textarea from '../Textarea'
import { getFlags } from '../../state/constants/flags'
import { Plus, Trash } from 'phosphor-react'

interface UIProps {
  setState: (pTx?: Partial<TransactionState> | undefined) => TransactionState | undefined
  resetState: (tt?: SelectOption) => TransactionState | undefined
  state: TransactionState
  estimateFee?: (...arg: any) => Promise<string | undefined>
}

export const TxUI: FC<UIProps> = ({ state: txState, setState, resetState, estimateFee }) => {
  const { accounts } = useSnapshot(state)
  const { selectedAccount, selectedDestAccount, selectedTransaction, txFields, selectedFlags } =
    txState

  const accountOptions: SelectOption[] = accounts.map(acc => ({
    label: acc.name,
    value: acc.address
  }))

  const destAccountOptions: SelectOption[] = accounts
    .map(acc => ({
      label: acc.name,
      value: acc.address
    }))
    .filter(acc => acc.value !== selectedAccount?.value)

  const flagsOptions: SelectOption[] = Object.entries(
    getFlags(selectedTransaction?.value) || {}
  ).map(([label, value]) => ({
    label,
    value
  }))

  const [feeLoading, setFeeLoading] = useState(false)

  const handleSetAccount = (acc: SelectOption) => {
    setState({ selectedAccount: acc })
    streamState.selectedAccount = acc
  }

  const handleSetField = useCallback(
    (field: keyof TxFields, value: string, opFields?: TxFields) => {
      const fields = opFields || txFields
      const obj = fields[field]
      setState({
        txFields: {
          ...fields,
          [field]: typeof obj === 'object' ? { ...obj, $value: value } : value
        }
      })
    },
    [setState, txFields]
  )

  const handleEstimateFee = useCallback(
    async (state?: TransactionState, silent?: boolean) => {
      setFeeLoading(true)

      const fee = await estimateFee?.(state, { silent })
      if (fee) handleSetField('Fee', fee, state?.txFields)

      setFeeLoading(false)
    },
    [estimateFee, handleSetField]
  )

  const handleChangeTxType = useCallback(
    (tt: SelectOption) => {
      setState({ selectedTransaction: tt })

      const newState = resetState(tt)

      handleEstimateFee(newState, true)
    },
    [handleEstimateFee, resetState, setState]
  )

  const switchToJson = () => setState({ viewType: 'json' })

  // default tx
  useEffect(() => {
    if (selectedTransaction?.value) return

    if (defaultTransactionType) {
      handleChangeTxType(defaultTransactionType)
    }
  }, [handleChangeTxType, selectedTransaction?.value])

  const fields = useMemo(
    () => getTxFields(selectedTransaction?.value),
    [selectedTransaction?.value]
  )

  const richFields = ['TransactionType', 'Account']
  if (fields.Destination !== undefined) {
    richFields.push('Destination')
  }

  if (flagsOptions.length) {
    richFields.push('Flags')
  }

  const otherFields = Object.keys(txFields).filter(k => !richFields.includes(k)) as [keyof TxFields]
  const hookParams = [{ id: 1 }]

  return (
    <Container
      css={{
        p: '$3 01',
        fontSize: '$sm',
        height: 'calc(100% - 45px)'
      }}
    >
      <Flex column fluid css={{ height: '100%', overflowY: 'auto', pr: '$1' }}>
        <TxField label="Transaction type">
          <Select
            instanceId="transactionsType"
            placeholder="Select transaction type"
            options={transactionsOptions}
            hideSelectedOptions
            value={selectedTransaction}
            onChange={(tt: any) => handleChangeTxType(tt)}
          />
        </TxField>
        <TxField label="Account">
          <Select
            instanceId="from-account"
            placeholder="Select your account"
            options={accountOptions}
            value={selectedAccount}
            onChange={(acc: any) => handleSetAccount(acc)} // TODO make react-select have correct types for acc
          />
        </TxField>
        {richFields.includes('Destination') && (
          <TxField label="Destination account">
            <Select
              instanceId="to-account"
              placeholder="Select the destination account"
              options={destAccountOptions}
              value={selectedDestAccount}
              isClearable
              onChange={(acc: any) => setState({ selectedDestAccount: acc })}
            />
          </TxField>
        )}
        {richFields.includes('Flags') && (
          <TxField label="Flags">
            <Select
              isClearable
              instanceId="flags"
              placeholder="Select flags to apply"
              menuPosition="fixed"
              value={selectedFlags}
              isMulti
              options={flagsOptions}
              onChange={flags => setState({ selectedFlags: flags as any })}
              closeMenuOnSelect={
                selectedFlags ? selectedFlags.length >= flagsOptions.length - 1 : false
              }
            />
          </TxField>
        )}
        {otherFields.map(field => {
          let _value = txFields[field]

          let value: string | undefined
          if (typeof _value === 'object') {
            if (_value.$type === 'json' && typeof _value.$value === 'object') {
              value = JSON.stringify(_value.$value, null, 2)
            } else {
              value = _value.$value.toString()
            }
          } else {
            value = _value?.toString()
          }

          const isXrp = typeof _value === 'object' && _value.$type === 'xrp'
          const isJson = typeof _value === 'object' && _value.$type === 'json'
          const isFee = field === 'Fee'
          let rows = isJson ? (value?.match(/\n/gm)?.length || 0) + 1 : undefined
          if (rows && rows > 5) rows = 5
          return (
            <TxField key={field} label={field + (isXrp ? ' (XRP)' : '')}>
              {isJson ? (
                <Textarea
                  rows={rows}
                  value={value}
                  spellCheck={false}
                  onChange={switchToJson}
                  css={{
                    flex: 'inherit',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <Input
                  type={isFee ? 'number' : 'text'}
                  value={value}
                  onChange={e => {
                    if (isFee) {
                      const val = e.target.value.replaceAll('.', '').replaceAll(',', '')
                      handleSetField(field, val)
                    } else {
                      handleSetField(field, e.target.value)
                    }
                  }}
                  onKeyPress={
                    isFee
                      ? e => {
                          if (e.key === '.' || e.key === ',') {
                            e.preventDefault()
                          }
                        }
                      : undefined
                  }
                  css={{
                    flex: 'inherit',
                    '-moz-appearance': 'textfield',
                    '&::-webkit-outer-spin-button': {
                      '-webkit-appearance': 'none',
                      margin: 0
                    },
                    '&::-webkit-inner-spin-button ': {
                      '-webkit-appearance': 'none',
                      margin: 0
                    }
                  }}
                />
              )}
              {isFee && (
                <Button
                  size="xs"
                  variant="primary"
                  outline
                  disabled={txState.txIsDisabled}
                  isDisabled={txState.txIsDisabled}
                  isLoading={feeLoading}
                  css={{
                    position: 'absolute',
                    right: '$2',
                    fontSize: '$xs',
                    cursor: 'pointer',
                    alignContent: 'center',
                    display: 'flex'
                  }}
                  onClick={() => handleEstimateFee()}
                >
                  Suggest
                </Button>
              )}
            </TxField>
          )
        })}
      </Flex>
    </Container>
  )
}

export const TxField: FC<{ label: string; children: ReactNode; isMulti?: boolean }> = ({
  label,
  children,
  isMulti = false
}) => {
  return (
    <Flex
      row
      fluid
      css={{
        justifyContent: 'flex-end',
        alignItems: isMulti ? 'flex-start' : 'center',
        position: 'relative',
        mb: '$3',
        mt: '1px',
        pr: '1px'
      }}
    >
      <Text muted css={{ mr: '$3', mt: isMulti ? '$2' : 0 }}>
        {label}:{' '}
      </Text>
      <Flex css={{ width: '70%', alignItems: 'center' }}>{children}</Flex>
    </Flex>
  )
}
