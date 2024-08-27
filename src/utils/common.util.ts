class CommonUtil {
  public splitArray<T = any>(arr: any[], len: number): T[][] {
    return arr.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / len);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    }, []) as T[][];
  }
}

export default new CommonUtil();
