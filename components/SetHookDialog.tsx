import { Plus, Trash, X } from "phosphor-react";
import React from "react";
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
import { Input } from "./Input";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";

import { TTS, tts } from "../utils/hookOnCalculator";
import { deployHook } from "../state/actions";
import type { IAccount } from "../state";
import { useSnapshot } from "valtio";
import state from "../state";

const transactionOptions = Object.keys(tts).map((key) => ({
  label: key,
  value: key as keyof TTS,
}));

export type SetHookData = {
  Invoke: {
    value: keyof TTS;
    label: string;
  }[];
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

export const SetHookDialog: React.FC<{ account: IAccount }> = ({ account }) => {
  const snap = useSnapshot(state);
  const {
    register,
    handleSubmit,
    control,
    // formState: { errors },
  } = useForm<SetHookData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "HookParameters", // unique name for your Field Array
  });
  // const {
  //   fields: grantFields,
  //   append: grantAppend,
  //   remove: grantRemove,
  // } = useFieldArray({
  //   control,
  //   name: "HookGrants", // unique name for your Field Array
  // });
  if (!account) {
    return null;
  }
  const onSubmit: SubmitHandler<SetHookData> = (data) => {
    deployHook(account, data);
  };
  return (
    <Dialog>
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent css={{ overflowY: "auto" }}>
          <DialogTitle>Deploy configuration</DialogTitle>
          <DialogDescription as="div">
            <Stack css={{ width: "100%", flex: 1 }}>
              <Box css={{ width: "100%" }}>
                <label>Invoke on transactions</label>
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
                      menuPosition="absolute"
                      styles={{
                        menuPortal: (provided) => ({
                          ...provided,
                          zIndex: 9000,
                        }),
                      }}
                      options={transactionOptions}
                    />
                  )}
                />
              </Box>
              <Box css={{ width: "100%" }}>
                <label style={{ marginBottom: "10px", display: "block" }}>
                  Hook parameters
                </label>
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
                        placeholder="Parameter value"
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
            <Button variant="primary" type="submit">
              Set Hook
            </Button>
            {/* </DialogClose> */}
          </Flex>
          <DialogClose asChild>
            <Box css={{ position: "absolute", top: "$3", right: "$3" }}>
              <X size="20px" />
            </Box>
          </DialogClose>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default SetHookDialog;