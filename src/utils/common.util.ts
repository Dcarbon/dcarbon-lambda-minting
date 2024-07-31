class CommonUtil {
  public splitArray(arr: any[], len: number): any[][] {
    return arr.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / len);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    }, []);
  }
}

export default new CommonUtil();
