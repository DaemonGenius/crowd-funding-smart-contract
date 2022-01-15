import web3 from "./web3";
import compiledFactory from './build/CrowdFundFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(compiledFactory.interface),
    '0x9BAB2d6B0C4FA50AaA0BB248744573FE6Cd9Aed4'
);


export default instance;