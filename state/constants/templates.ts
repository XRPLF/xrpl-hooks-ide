import Carbon from "../../components/icons/Carbon";
import Firewall from "../../components/icons/Firewall";
import Notary from "../../components/icons/Notary";
import Peggy from "../../components/icons/Peggy";
import Starter from "../../components/icons/Starter";

export const templateFileIds = {
    'starter': {
        id: '9106f1fe60482d90475bfe8f1315affe',
        name: 'Starter',
        description: 'Just a basic starter with essential imports, just accepts any transaction coming through',
        icon: Starter

    },
    'firewall': {
        id: '741816f53eddac862ef1ba400e1b9b84',
        name: 'Firewall',
        description: 'This Hook essentially checks a blacklist of accounts',
        icon: Firewall
    },
    'notary': {
        id: '0dfe12adb0aa75cff24c3c19497fb95a',
        name: 'Notary',
        description: 'Collecting signatures for multi-sign transactions',
        icon: Notary
    },
    'carbon': {
        id: '5941c19dce3e147948f564e224553c02',
        name: 'Carbon',
        description: 'Send a percentage of sum to an address',
        icon: Carbon
    },
    'peggy': {
        id: '52e61c02e777c44c913808981a4ca61f',
        name: 'Peggy',
        description: 'An oracle based stable coin hook',
        icon: Peggy
    },
}

export const apiHeaderFiles = ['hookapi.h', 'sfcodes.h', 'macro.h', 'hookmacro.h', 'extern.h', 'error.h']
