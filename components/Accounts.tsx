import toast from "react-hot-toast";
import { useSnapshot } from "valtio";
import { ArrowSquareOut, Copy, Wallet, X } from "phosphor-react";
import React, { useEffect, useState, FC } from "react";
import Dinero from "dinero.js";

import Button from "./Button";
import { addFaucetAccount, deployHook, importAccount } from "../state/actions";
import state from "../state";
import Box from "./Box";
import { Container, Heading, Stack, Text, Flex } from ".";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "./Dialog";
import { css } from "../stitches.config";
import { Input } from "./Input";

const labelStyle = css({
  color: "$mauve10",
  textTransform: "uppercase",
  fontSize: "10px",
  mb: "$0.5",
});

const AccountDialog = ({
  activeAccountAddress,
  setActiveAccountAddress,
}: {
  activeAccountAddress: string | null;
  setActiveAccountAddress: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const snap = useSnapshot(state);
  const [showSecret, setShowSecret] = useState(false);
  const activeAccount = snap.accounts.find(account => account.address === activeAccountAddress);
  return (
    <Dialog
      open={Boolean(activeAccountAddress)}
      onOpenChange={open => {
        setShowSecret(false);
        !open && setActiveAccountAddress(null);
      }}
    >
      <DialogContent
        css={{
          backgroundColor: "$mauve1 !important",
          border: "1px solid $mauve2",
          ".dark &": {
            // backgroundColor: "$black !important",
          },
          p: "$3",
          "&:before": {
            content: " ",
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 0.2,
            ".dark &": {
              opacity: 1,
            },
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: `url('/pattern-dark.svg'), url('/pattern-dark-2.svg')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom left, top right",
          },
        }}
      >
        <DialogTitle
          css={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            borderBottom: "1px solid $mauve6",
            pb: "$3",
            gap: "$3",
            fontSize: "$md",
          }}
        >
          <Wallet size="15px" /> {activeAccount?.name}
        </DialogTitle>
        <DialogDescription as="div" css={{ fontFamily: "$monospace" }}>
          <Stack css={{ display: "flex", flexDirection: "column", gap: "$3" }}>
            <Flex css={{ alignItems: "center" }}>
              <Flex css={{ flexDirection: "column" }}>
                <Text className={labelStyle()}>Account Address</Text>
                <Text
                  css={{
                    fontFamily: "$monospace",
                  }}
                >
                  {activeAccount?.address}
                </Text>
              </Flex>
              <Flex css={{ marginLeft: "auto", color: "$mauve12" }}>
                <Button
                  size="sm"
                  ghost
                  css={{ mt: "$3" }}
                  onClick={() => {
                    navigator.clipboard.writeText(activeAccount?.address || "");
                    toast.success("Copied address to clipboard");
                  }}
                >
                  <Copy size="15px" />
                </Button>
              </Flex>
            </Flex>
            <Flex css={{ alignItems: "center" }}>
              <Flex css={{ flexDirection: "column" }}>
                <Text className={labelStyle()}>Secret</Text>
                <Text
                  as="div"
                  css={{
                    fontFamily: "$monospace",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showSecret
                    ? activeAccount?.secret
                    : "•".repeat(activeAccount?.secret.length || 16)}{" "}
                  <Button
                    css={{
                      fontFamily: "$monospace",
                      lineHeight: 2,
                      mt: "2px",
                      ml: "$3",
                    }}
                    ghost
                    size="xs"
                    onClick={() => setShowSecret(curr => !curr)}
                  >
                    {showSecret ? "Hide" : "Show"}
                  </Button>
                </Text>
              </Flex>
              <Flex css={{ marginLeft: "auto", color: "$mauve12" }}>
                <Button
                  size="sm"
                  ghost
                  onClick={() => {
                    navigator.clipboard.writeText(activeAccount?.secret || "");
                    toast.success("Copied secret to clipboard");
                  }}
                  css={{ mt: "$3" }}
                >
                  <Copy size="15px" />
                </Button>
              </Flex>
            </Flex>
            <Flex css={{ alignItems: "center" }}>
              <Flex css={{ flexDirection: "column" }}>
                <Text className={labelStyle()}>Balances & Objects</Text>
                <Text
                  css={{
                    fontFamily: "$monospace",
                  }}
                >
                  {Dinero({
                    amount: Number(activeAccount?.xrp || "0"),
                    precision: 6,
                  })
                    .toUnit()
                    .toLocaleString(undefined, {
                      style: "currency",
                      currency: "XRP",
                      currencyDisplay: "name",
                    })}
                </Text>
              </Flex>
              <Flex css={{ marginLeft: "auto" }}>
                <a
                  href={`https://hooks-testnet-explorer.xrpl-labs.com/${activeAccount?.address}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Button size="sm" ghost css={{ color: "$green11 !important", mt: "$3" }}>
                    <ArrowSquareOut size="15px" />
                  </Button>
                </a>
              </Flex>
            </Flex>
            <Flex css={{ alignItems: "center" }}>
              <Flex css={{ flexDirection: "column" }}>
                <Text className={labelStyle()}>Installed Hooks</Text>
                <Text
                  css={{
                    fontFamily: "$monospace",
                  }}
                >
                  {activeAccount && activeAccount.hooks.length}
                </Text>
              </Flex>
            </Flex>
          </Stack>
        </DialogDescription>
        <DialogClose asChild>
          <Box css={{ position: "absolute", top: "$3", right: "$3" }}>
            <X size="20px" />
          </Box>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

interface AccountProps {
  card?: boolean;
  hideDeployBtn?: boolean;
  showHookStats?: boolean;
}

const Accounts: FC<AccountProps> = props => {
  const snap = useSnapshot(state);
  const [activeAccountAddress, setActiveAccountAddress] = useState<string | null>(null);
  useEffect(() => {
    const fetchAccInfo = async () => {
      if (snap.clientStatus === "online") {
        const requests = snap.accounts.map(acc =>
          snap.client?.send({
            id: acc.address,
            command: "account_info",
            account: acc.address,
          })
        );
        const responses = await Promise.all(requests);
        responses.forEach((res: any) => {
          const address = res?.account_data?.Account as string;
          const balance = res?.account_data?.Balance as string;
          const sequence = res?.account_data?.Sequence as number;
          const accountToUpdate = state.accounts.find(acc => acc.address === address);
          if (accountToUpdate) {
            accountToUpdate.xrp = balance;
            accountToUpdate.sequence = sequence;
          }
        });
        const objectRequests = snap.accounts.map(acc => {
          return snap.client?.send({
            id: `${acc.address}-hooks`,
            command: "account_objects",
            account: acc.address,
          });
        });
        const objectResponses = await Promise.all(objectRequests);
        objectResponses.forEach((res: any) => {
          const address = res?.account as string;
          const accountToUpdate = state.accounts.find(acc => acc.address === address);
          if (accountToUpdate) {
            accountToUpdate.hooks = res.account_objects
              .filter((ac: any) => ac?.LedgerEntryType === "Hook")
              .map((oo: any) => oo.HookHash);
          }
        });
      }
    };

    let fetchAccountInfoInterval: NodeJS.Timer;
    if (snap.clientStatus === "online") {
      fetchAccInfo();
      fetchAccountInfoInterval = setInterval(() => fetchAccInfo(), 2000);
    }

    return () => {
      if (snap.accounts.length > 0) {
        if (fetchAccountInfoInterval) {
          clearInterval(fetchAccountInfoInterval);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap.accounts, snap.clientStatus]);
  return (
    <Box
      as="div"
      css={{
        display: "flex",
        backgroundColor: props.card ? "$deep" : "$mauve1",
        position: "relative",
        flex: "1",
        height: "100%",
        border: "1px solid $mauve6",
        borderRadius: props.card ? "$md" : undefined,
      }}
    >
      <Container css={{ p: 0, flexShrink: 1, height: "100%" }}>
        <Flex
          css={{
            py: "$3",
            borderBottom: props.card ? "1px solid $mauve6" : undefined,
          }}
        >
          <Heading
            as="h3"
            css={{
              fontWeight: 300,
              m: 0,
              fontSize: "11px",
              color: "$mauve12",
              px: "$3",
              textTransform: "uppercase",
              alignItems: "center",
              display: "inline-flex",
              gap: "$3",
            }}
          >
            <Wallet size="15px" /> <Text css={{ lineHeight: 1 }}>Accounts</Text>
          </Heading>
          <Flex css={{ ml: "auto", gap: "$3", marginRight: "$3" }}>
            <Button ghost size="sm" onClick={() => addFaucetAccount(true)}>
              Create
            </Button>
            <ImportAccountDialog />
          </Flex>
        </Flex>
        <Stack
          css={{
            flexDirection: "column",
            width: "100%",
            fontSize: "13px",
            wordWrap: "break-word",
            fontWeight: "$body",
            fontFamily: "$monospace",
            gap: 0,
            height: "calc(100% - 52px)",
            flexWrap: "nowrap",
            overflowY: "auto",
          }}
        >
          {snap.accounts.map(account => (
            <Flex
              column
              key={account.address + account.name}
              onClick={() => setActiveAccountAddress(account.address)}
              css={{
                px: "$3",
                py: props.card ? "$3" : "$2",
                cursor: "pointer",
                borderBottom: props.card ? "1px solid $mauve6" : undefined,
                "@hover": {
                  "&:hover": {
                    background: "$backgroundAlt",
                  },
                },
              }}
            >
              <Flex
                row
                css={{
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Text>{account.name} </Text>
                  <Text
                    css={{
                      color: "$mauve9",
                      wordBreak: "break-word",
                    }}
                  >
                    {account.address} (
                    {Dinero({
                      amount: Number(account?.xrp || "0"),
                      precision: 6,
                    })
                      .toUnit()
                      .toLocaleString(undefined, {
                        style: "currency",
                        currency: "XRP",
                        currencyDisplay: "name",
                      })}
                    )
                  </Text>
                </Box>
                {!props.hideDeployBtn && (
                  <Button
                    css={{ ml: "auto" }}
                    size="xs"
                    uppercase
                    isLoading={account.isLoading}
                    disabled={
                      account.isLoading ||
                      !snap.files.filter(file => file.compiledWatContent).length
                    }
                    variant="secondary"
                    onClick={e => {
                      e.stopPropagation();
                      deployHook(account);
                    }}
                  >
                    Deploy
                  </Button>
                )}
              </Flex>
              {props.showHookStats && (
                <Text muted small css={{ mt: "$2" }}>
                  {account.hooks.length} hook{account.hooks.length === 1 ? "" : "s"} installed
                </Text>
              )}
            </Flex>
          ))}
        </Stack>
      </Container>
      <AccountDialog
        activeAccountAddress={activeAccountAddress}
        setActiveAccountAddress={setActiveAccountAddress}
      />
    </Box>
  );
};

const ImportAccountDialog = () => {
  const [value, setValue] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button ghost size="sm">
          Import
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Import account</DialogTitle>
        <DialogDescription>
          <label>Add account secret</label>
          <Input
            name="secret"
            type="password"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
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
          <DialogClose asChild>
            <Button
              variant="primary"
              onClick={() => {
                importAccount(value);
                setValue("");
              }}
            >
              Import account
            </Button>
          </DialogClose>
        </Flex>
        <DialogClose asChild>
          <Box css={{ position: "absolute", top: "$3", right: "$3" }}>
            <X size="20px" />
          </Box>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default Accounts;
