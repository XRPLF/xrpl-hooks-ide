import { FC, useCallback, useEffect, useMemo, useState } from 'react'
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

interface UIProps {
  setState: (pTx?: Partial<TransactionState> | undefined) => TransactionState | undefined
  state: TransactionState
  estimateFee?: (...arg: any) => Promise<string | undefined>
}

export const TxUI: FC<UIProps> = ({ state: txState, setState, estimateFee }) => {
  const { accounts } = useSnapshot(state)
  const { selectedAccount, selectedDestAccount, selectedTransaction, txFields } = txState

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

  const [feeLoading, setFeeLoading] = useState(false)

  const resetFields = useCallback(
    (tt: string) => {
      const fields = getTxFields(tt)

      if (fields.Destination !== undefined) {
        setState({ selectedDestAccount: null })
        fields.Destination = ''
      } else {
        fields.Destination = undefined
      }
      return setState({ txFields: fields })
    },
    [setState]
  )

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

      const newState = resetFields(tt.value)

      handleEstimateFee(newState, true)
    },
    [handleEstimateFee, resetFields, setState]
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

  const specialFields = ['TransactionType', 'Account']
  if (fields.Destination !== undefined) {
    specialFields.push('Destination')
  }

  const otherFields = Object.keys(txFields).filter(k => !specialFields.includes(k)) as [
    keyof TxFields
  ]

  return (
    <Container
      css={{
        p: '$3 01',
        fontSize: '$sm',
        height: 'calc(100% - 45px)'
      }}
    >
      <Flex column fluid css={{ height: '100%', overflowY: 'auto', pr: '$1' }}>
        <Flex
          row
          fluid
          css={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: '$3',
            mt: '1px',
            pr: '1px',
            '@xl': {
              justifyContent: 'flex-end'
            }
          }}
        >
          <Text muted css={{ mr: '$3' }}>
            Transaction type:{' '}
          </Text>
          <Select
            instanceId="transactionsType"
            placeholder="Select transaction type"
            options={transactionsOptions}
            hideSelectedOptions
            css={{
              width: '60%',
              minWidth: '200px',
              '@lg': {
                width: '70%'
              }
            }}
            value={selectedTransaction}
            onChange={(tt: any) => handleChangeTxType(tt)}
          />
        </Flex>
        <Flex
          row
          fluid
          css={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: '$3',
            pr: '1px',
            '@xl': {
              justifyContent: 'flex-end'
            }
          }}
        >
          <Text muted css={{ mr: '$3' }}>
            Account:{' '}
          </Text>
          <Select
            instanceId="from-account"
            placeholder="Select your account"
            css={{
              width: '60%',
              minWidth: '200px',
              '@lg': {
                width: '70%'
              }
            }}
            options={accountOptions}
            value={selectedAccount}
            onChange={(acc: any) => handleSetAccount(acc)} // TODO make react-select have correct types for acc
          />
        </Flex>
        {fields.Destination !== undefined && (
          <Flex
            row
            fluid
            css={{
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: '$3',
              pr: '1px',
              '@xl': {
                justifyContent: 'flex-end'
              }
            }}
          >
            <Text muted css={{ mr: '$3' }}>
              Destination account:{' '}
            </Text>
            <Select
              instanceId="to-account"
              placeholder="Select the destination account"
              css={{
                width: '60%',
                minWidth: '200px',
                '@lg': {
                  width: '70%'
                }
              }}
              options={destAccountOptions}
              value={selectedDestAccount}
              isClearable
              onChange={(acc: any) => setState({ selectedDestAccount: acc })}
            />
          </Flex>
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
            <Flex column key={field} css={{ mb: '$2', pr: '1px' }}>
              <Flex
                row
                fluid
                css={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  '@xl': {
                    justifyContent: 'flex-end'
                  }
                }}
              >
                <Text muted css={{ mr: '$3' }}>
                  {field + (isXrp ? ' (XRP)' : '')}:{' '}
                </Text>
                {isJson ? (
                  <Textarea
                    rows={rows}
                    value={value}
                    spellCheck={false}
                    onChange={switchToJson}
                    css={{
                      width: '60%',
                      minWidth: '200px',
                      flex: 'inherit',
                      resize: 'vertical',
                      '@lg': {
                        width: '70%'
                      }
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
                      width: '60%',
                      minWidth: '200px',
                      flex: 'inherit',
                      '-moz-appearance': 'textfield',
                      '&::-webkit-outer-spin-button': {
                        '-webkit-appearance': 'none',
                        margin: 0
                      },
                      '&::-webkit-inner-spin-button ': {
                        '-webkit-appearance': 'none',
                        margin: 0
                      },
                      '@lg': {
                        width: '70%'
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
              </Flex>
            </Flex>
          )
        })}
      </Flex>
    </Container>
  )
}
