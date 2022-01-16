import web3 from "./web3";
import compiledFactory from './build/CrowdFundFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(compiledFactory.interface),
    '0x14a78ce80582A65A5862DE647808Ea1Cf34a295E'
);


export default instance;