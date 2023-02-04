export class Helpers {

  static async timeout(ms) {
    return new Promise(res => setTimeout(() => res(), ms));
  }
  
}
