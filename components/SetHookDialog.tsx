import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash, X } from "phosphor-react";
import Button from "./Button";
import Box from "./Box";
import { Stack, Flex, Select } from ".";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "./Dialog";
import { Input, Label } from "./Input";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";

import { TTS, tts } from "../utils/hookOnCalculator";
import { deployHook } from "../state/actions";
import { useSnapshot } from "valtio";
import state from "../state";
import toast from "react-hot-toast";
import { prepareDeployHookTx, sha256 } from "../state/actions/deployHook";
import estimateFee from "../utils/estimateFee";

const transactionOptions = Object.keys(tts).map((key) => ({
  label: key,
  value: key as keyof TTS,
}));

export type SetHookData = {
  Invoke: {
    value: keyof TTS;
    label: string;
  }[];
  Fee: string;
  HookNamespace: string;
  HookParameters: {
    HookParameter: {
      HookParameterName: string;
      HookParameterValue: string;
    };
  }[];
  // HookGrants: {
  //   HookGrant: {
  //     Authorize: string;
  //     HookHash: string;
  //   };
  // }[];
};

export const SetHookDialog: React.FC<{ accountAddress: string }> = React.memo(
  ({ accountAddress }) => {
    const snap = useSnapshot(state);
    const account = snap.accounts.find((acc) => acc.address === accountAddress);

    const [isSetHookDialogOpen, setIsSetHookDialogOpen] = useState(false);
    const {
      register,
      handleSubmit,
      control,
      watch,
      setValue,
      getValues,
      formState: { errors },
    } = useForm<SetHookData>({
      defaultValues: {
        HookNamespace:
          snap.files?.[snap.activeWat]?.name?.split(".")?.[0] || "",
        Invoke: transactionOptions.filter((to) => to.label === "ttPAYMENT"),
      },
    });
    const { fields, append, remove } = useFieldArray({
      control,
      name: "HookParameters", // unique name for your Field Array
    });
    const [formInitialized, setFormInitialized] = useState(false);
    const [estimateLoading, setEstimateLoading] = useState(false);

    // Update value if activeWat changes
    useEffect(() => {
      setValue(
        "HookNamespace",
        snap.files?.[snap.activeWat]?.name?.split(".")?.[0] || ""
      );
      setFormInitialized(true);
    }, [snap.activeWat, snap.files, setValue]);
    // const {
    //   fields: grantFields,
    //   append: grantAppend,
    //   remove: grantRemove,
    // } = useFieldArray({
    //   control,
    //   name: "HookGrants", // unique name for your Field Array
    // });
    const [hashedNamespace, setHashedNamespace] = useState("");
    const namespace = watch(
      "HookNamespace",
      snap.files?.[snap.active]?.name?.split(".")?.[0] || ""
    );
    const calculateHashedValue = useCallback(async () => {
      const hashedVal = await sha256(namespace);
      setHashedNamespace(hashedVal.toUpperCase());
    }, [namespace]);
    useEffect(() => {
      calculateHashedValue();
    }, [namespace, calculateHashedValue]);

    // Calcucate initial fee estimate when modal opens
    useEffect(() => {
      if (formInitialized && account) {
        (async () => {
          const formValues = getValues();
          const tx = await prepareDeployHookTx(account, formValues);
          if (!tx) {
            return;
          }
          const res = await estimateFee(tx, account);
          if (res && res.base_fee) {
            setValue("Fee", Math.round(Number(res.base_fee || "")).toString());
          }
        })();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formInitialized]);

    if (!account) {
      return null;
    }

    const onSubmit: SubmitHandler<SetHookData> = async (data) => {
      const currAccount = state.accounts.find(
        (acc) => acc.address === account.address
      );
      if (currAccount) currAccount.isLoading = true;
      const res = await deployHook(account, data);
      if (currAccount) currAccount.isLoading = false;

      if (res && res.engine_result === "tesSUCCESS") {
        toast.success("Transaction succeeded!");
        return setIsSetHookDialogOpen(false);
      }
      toast.error(`Transaction failed! (${res?.engine_result_message})`);
    };
    return (
      <Dialog open={isSetHookDialogOpen} onOpenChange={setIsSetHookDialogOpen}>
        <DialogTrigger asChild>
          <Button
            ghost
            size="xs"
            uppercase
            variant={"secondary"}
            disabled={
              account.isLoading ||
              !snap.files.filter((file) => file.compiledWatContent).length
            }
          >
            Set Hook
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>Deploy configuration</DialogTitle>
            <DialogDescription as="div">
              <Stack css={{ width: "100%", flex: 1 }}>
                <Box css={{ width: "100%" }}>
                  <Label>Invoke on transactions</Label>
                  <Controller
                    name="Invoke"
                    control={control}
                    defaultValue={transactionOptions.filter(
                      (to) => to.label === "ttPAYMENT"
                    )}
                    render={({ field }) => (
                      <Select
                        {...field}
                        closeMenuOnSelect={false}
                        isMulti
                        menuPosition="fixed"
                        options={transactionOptions}
                      />
                    )}
                  />
                </Box>
                <Box css={{ width: "100%" }}>
                  <Label>Hook Namespace Seed</Label>
                  <Input
                    {...register("HookNamespace", { required: true })}
                    autoComplete={"off"}
                    defaultValue={
                      snap.files?.[snap.activeWat]?.name?.split(".")?.[0] || ""
                    }
                  />
                  {errors.HookNamespace?.type === "required" && (
                    <Box css={{ display: "inline", color: "$red11" }}>
                      Namespace is required
                    </Box>
                  )}
                  <Box css={{ mt: "$3" }}>
                    <Label>Hook Namespace (sha256)</Label>
                    <Input readOnly value={hashedNamespace} />
                  </Box>
                </Box>

                <Box css={{ width: "100%" }}>
                  <Label style={{ marginBottom: "10px", display: "block" }}>
                    Hook parameters
                  </Label>
                  <Stack>
                    {fields.map((field, index) => (
                      <Stack key={field.id}>
                        <Input
                          // important to include key with field's id
                          placeholder="Parameter name"
                          {...register(
                            `HookParameters.${index}.HookParameter.HookParameterName`
                          )}
                        />
                        <Input
                          placeholder="Value (hex-quoted)"
                          {...register(
                            `HookParameters.${index}.HookParameter.HookParameterValue`
                          )}
                        />
                        <Button onClick={() => remove(index)} variant="destroy">
                          <Trash weight="regular" size="16px" />
                        </Button>
                      </Stack>
                    ))}
                    <Button
                      outline
                      fullWidth
                      type="button"
                      onClick={() =>
                        append({
                          HookParameter: {
                            HookParameterName: "",
                            HookParameterValue: "",
                          },
                        })
                      }
                    >
                      <Plus size="16px" />
                      Add Hook Parameter
                    </Button>
                  </Stack>
                </Box>
                <Box css={{ width: "100%", position: "relative" }}>
                  <Label>Fee</Label>
                  <Box css={{ display: "flex", alignItems: "center" }}>
                    <Input
                      type="number"
                      {...register("Fee", { required: true })}
                      autoComplete={"off"}
                      onKeyPress={(e) => {
                        if (e.key === "." || e.key === ",") {
                          e.preventDefault();
                        }
                      }}
                      step="1"
                      defaultValue={10000}
                      css={{
                        "-moz-appearance": "textfield",
                        "&::-webkit-outer-spin-button": {
                          "-webkit-appearance": "none",
                          margin: 0,
                        },
                        "&::-webkit-inner-spin-button ": {
                          "-webkit-appearance": "none",
                          margin: 0,
                        },
                      }}
                    />
                    <Button
                      size="xs"
                      variant="primary"
                      outline
                      isLoading={estimateLoading}
                      css={{
                        position: "absolute",
                        right: "$2",
                        fontSize: "$xs",
                        cursor: "pointer",
                        alignContent: "center",
                        display: "flex",
                      }}
                      onClick={async (e) => {
                        e.preventDefault();
                        setEstimateLoading(true);
                        const formValues = getValues();
                        try {
                          const tx = await prepareDeployHookTx(
                            account,
                            formValues
                          );
                          if (tx) {
                            const res = await estimateFee(tx, account);

                            if (res && res.base_fee) {
                              setValue(
                                "Fee",
                                Math.round(
                                  Number(res.base_fee || "")
                                ).toString()
                              );
                            }
                          }
                        } catch (err) {}

                        setEstimateLoading(false);
                      }}
                    >
                      Suggest
                    </Button>
                  </Box>
                  {errors.Fee?.type === "required" && (
                    <Box css={{ display: "inline", color: "$red11" }}>
                      Fee is required
                    </Box>
                  )}
                </Box>
                {/* <Box css={{ width: "100%" }}>
                <label style={{ marginBottom: "10px", display: "block" }}>
                  Hook Grants
                </label>
                <Stack>
                  {grantFields.map((field, index) => (
                    <Stack key={field.id}>
                      <Input
                        // important to include key with field's id
                        placeholder="Authorize"
                        {...register(
                          `HookGrants.${index}.HookGrant.Authorize`,
                          { minLength: 5 }
                        )}
                      />
                      <Input
                        placeholder="HookHash"
                        {...register(`HookGrants.${index}.HookGrant.HookHash`, {
                          minLength: 64,
                          maxLength: 64,
                        })}
                      />
                      <Button
                        onClick={() => grantRemove(index)}
                        variant="destroy"
                      >
                        <Trash weight="regular" size="16px" />
                      </Button>
                    </Stack>
                  ))}
                  <Button
                    outline
                    fullWidth
                    type="button"
                    onClick={() =>
                      grantAppend({
                        HookGrant: {
                          Authorize: "",
                          HookHash: "",
                        },
                      })
                    }
                  >
                    <Plus size="16px" />
                    Add Hook Grant
                  </Button>
                </Stack>
              </Box> */}
              </Stack>
            </DialogDescription>

            <Flex
              css={{
                marginTop: 25,
                justifyContent: "flex-end",
                gap: "$3",
              }}
            >
              <DialogClose asChild>
                <Button outline>Cancel</Button>
              </DialogClose>
              {/* <DialogClose asChild> */}
              <Button
                variant="primary"
                type="submit"
                isLoading={account.isLoading}
              >
                Set Hook
              </Button>
              {/* </DialogClose> */}
            </Flex>
            <DialogClose asChild>
              <Box css={{ position: "absolute", top: "$3", right: "$3" }}>
                <X size="20px" />
              </Box>
            </DialogClose>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

SetHookDialog.displayName = "SetHookDialog";

export default SetHookDialog;
