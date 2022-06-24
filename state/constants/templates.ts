import Carbon from "../../components/icons/Carbon";
import Firewall from "../../components/icons/Firewall";
import Notary from "../../components/icons/Notary";
import Peggy from "../../components/icons/Peggy";
import Starter from "../../components/icons/Starter";

export const templateFileIds = {
    'starter': {
        id: '1f7d2963d9e342ea092286115274f3e3',
        name: 'Starter',
        description: 'Just a basic starter with essential imports, just accepts any transaction coming through',
        icon: Starter

    },
    'firewall': {
        id: '70edec690f0de4dd315fad1f4f996d8c',
        name: 'Firewall',
        description: 'This Hook essentially checks a blacklist of accounts',
        icon: Firewall
    },
    'notary': {
        id: '3d5677768fe8a54c4f6317e185d9ba66',
        name: 'Notary',
        description: 'Collecting signatures for multi-sign transactions',
        icon: Notary
    },
    'carbon': {
        id: 'a9fbcaf1b816b198c7fc0f62962bebf2',
        name: 'Carbon',
        description: 'Send a percentage of sum to an address',
        icon: Carbon
    },
    'peggy': {
        id: 'd21298a37e1550b781682014762a567b',
        name: 'Peggy',
        description: 'An oracle based stable coin hook',
        icon: Peggy
    },
}

export const apiHeaderFiles = ['hookapi.h', 'sfcodes.h', 'hookmacro.h', 'extern.h', 'error.h']
