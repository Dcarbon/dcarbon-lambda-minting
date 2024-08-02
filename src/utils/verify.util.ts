import * as abi from 'ethereumjs-abi';
import * as ethUtil from 'ethereumjs-util';

class VerifyUtil {
  public types = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    primaryType: 'Mint',
    Mint: [
      { name: 'iot', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  dependencies(primaryType: any, found = []) {
    if (found.includes(primaryType)) {
      return found;
    }
    if (this.types[primaryType] === undefined) {
      return found;
    }
    found.push(primaryType);
    for (const field of this.types[primaryType]) {
      for (const dep of this.dependencies(field.type, found)) {
        if (!found.includes(dep)) {
          found.push(dep);
        }
      }
    }
    return found;
  }

  encodeType(primaryType: any) {
    // Get dependencies primary first, then alphabetical
    let deps = this.dependencies(primaryType);
    deps = deps.filter((t) => t != primaryType);
    deps = [primaryType].concat(deps.sort());

    // Format as a string with fields
    let result = '';
    for (const type of deps) {
      result += `${type}(${this.types[type].map(({ name, type: type2 }) => `${type2} ${name}`).join(',')})`;
    }
    return result;
  }

  typeHash(primaryType: any) {
    return ethUtil.keccakFromString(this.encodeType(primaryType), 256);
  }

  encodeData(primaryType: any, data: any) {
    const encTypes = [];
    const encValues = [];
    encTypes.push('bytes32');
    encValues.push(this.typeHash(primaryType));

    // Add field contents
    for (const field of this.types[primaryType]) {
      let value = data[field.name];
      if (field.type == 'string' || field.type == 'bytes') {
        encTypes.push('bytes32');
        value = ethUtil.keccakFromString(value, 256);
        encValues.push(value);
      } else if (this.types[field.type] !== undefined) {
        encTypes.push('bytes32');
        value = ethUtil.keccak256(this.encodeData(field.type, value));
        encValues.push(value);
      } else if (field.type.lastIndexOf(']') === field.type.length - 1) {
        throw new Error('TODO: Arrays currently unimplemented in encodeData');
      } else {
        encTypes.push(field.type);
        encValues.push(value);
      }
    }

    return abi.rawEncode(encTypes, encValues);
  }

  structHash(primaryType: any, data: any) {
    return ethUtil.keccak256(this.encodeData(primaryType, data));
  }
}

export default new VerifyUtil();
