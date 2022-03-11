const tts = {
  ttPAYMENT: 0,
  ttESCROW_CREATE: 1,
  ttESCROW_FINISH: 2,
  ttACCOUNT_SET: 3,
  ttESCROW_CANCEL: 4,
  ttREGULAR_KEY_SET: 5,
  ttOFFER_CREATE: 7,
  ttOFFER_CANCEL: 8,
  ttTICKET_CREATE: 10,
  ttSIGNER_LIST_SET: 12,
  ttPAYCHAN_CREATE: 13,
  ttPAYCHAN_FUND: 14,
  ttPAYCHAN_CLAIM: 15,
  ttCHECK_CREATE: 16,
  ttCHECK_CASH: 17,
  ttCHECK_CANCEL: 18,
  ttDEPOSIT_PREAUTH: 19,
  ttTRUST_SET: 20,
  ttACCOUNT_DELETE: 21,
  ttHOOK_SET: 22
};

type TTS = typeof tts;

const calculateHookOn = (arr: (keyof TTS)[]) => {
  let start = '0x0000000000000000';
  arr.forEach(n => {
    let v = BigInt(start);
    v ^= (BigInt(1) << BigInt(tts[n]));
    let s = v.toString(16);
    let l = s.length;
    if (l < 16)
      s = '0'.repeat(16 - l) + s;
    s = '0x' + s;
    start = s;
  })
  return start.substring(2);
}

export default calculateHookOn