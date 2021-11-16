import { useCallback, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { verifyTypedData } from "ethers/lib/utils";
import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";


const domain: TypedDataDomain = {
  name: 'Gateway Powo',
  version: '1',
  chainId: 1,
}

const types: Record<string, Array<TypedDataField>> = {
  PoWo: [
    { name: 'expires', type: 'string' },
    { name: 'gatekeeperAddress', type: 'address' }, // is this the right Type?, string for DID?
    { name: 'gatekeeperURL', type: 'string' },
  ]
}

type EthPowoSignature = {
  expires: string,
  gatekeeperAddress: string,
  gatekeeperURL: string
}

export default function TypedDataSigner() {

  const { account, library } = useWeb3React<Web3Provider>()

  const [expires, setExpires] = useState(new Date(Date.now() + (30 * 60 * 1000)));
  const [gatekeeperAddress, setGatekeeperAddress] = useState('0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826');
  const [gatekeeperURL, setGatekeeperURL] = useState('https://api.civic.com/asdf');


  const getValue = useCallback(() => ({
    expires: expires.toISOString(),
    gatekeeperAddress,
    gatekeeperURL,
  }), [expires, gatekeeperAddress, gatekeeperURL])



  const [signature, setSignature] = useState('');
  const [valid, setValid] = useState(false);

  const sign = async () => {
    const signer = library.getSigner()
    const signature = await signer._signTypedData(domain, types, getValue());
    setAndValidateSignature(signature)
  }

  const verify = (sig) => {
    try {
      const value = getValue();
      const recoveredAddress = verifyTypedData(domain, types, value, sig)
      // Note: the verification method needs the source address
      if (recoveredAddress !== account) {
        throw new Error('Message was signed by unexpected wallet.')
      }

      // check time
      if (new Date(value.expires).getTime() < Date.now()) {
        throw new Error('Token Expired.')
      }

      setValid(true)
    } catch (e) {
      setValid(false)
    }
  }

  const setAndValidateSignature = useCallback((sig) => {
    setSignature(sig)
    verify(sig)
  }, [verify, setSignature])


  return <>
    <div className="mt-1">
      <input type="text" name="gatekeeperAddress" id="gatekeeperAddress"
             className="px-3 py-2 shadow-sm focus:ring-red-800 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 border rounded-md"
             placeholder="0x..."
             value={expires.toISOString()}
             onChange={(e) => setExpires(new Date(e.target.value.trim()))}
      />
      <input type="text" name="gatekeeperAddress" id="gatekeeperAddress"
             className="px-3 py-2 shadow-sm focus:ring-red-800 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 border rounded-md"
             placeholder="0x..."
             value={gatekeeperAddress}
             onChange={(e) => setGatekeeperAddress(e.target.value.trim())}
      />
      <input type="text" name="gatekeeperURL" id="gatekeeperURL"
             className="px-3 py-2 shadow-sm focus:ring-red-800 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 border rounded-md"
             placeholder="https://..."
             value={gatekeeperURL}
             onChange={(e) => setGatekeeperURL(e.target.value.trim())}
      />
    </div>

    <button onClick={sign} className="py-2 mt-2 mb-4 text-lg font-bold text-white rounded-lg w-56 bg-blue-600 hover:bg-blue-800">Sign typed data</button>


    <div className="mt-1">
                <textarea
                  id="signedOutput"
                  name="signedOutput"
                  rows={3}
                  className="px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  value={signature}
                  onChange={(x) => setAndValidateSignature(x.target.value)}
                />
    </div>

    <div className="inline-flex items-center" title={valid ? 'Signature is valid' : 'Signature is NOT valid'}>
      <p className="text-gray-800 text-lg cursor-default">Valid Signature:</p>
      { valid ?
          <FontAwesomeIcon icon={faCheckCircle} className="w-4 m-2" color="green" /> :
          <FontAwesomeIcon icon={faTimesCircle} className="w-4 m-2" color="red" />
      }
    </div>
  </>
}