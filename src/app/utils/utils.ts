import { Injectable } from '@angular/core';
import Parse from 'parse';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  roleAdmin: any;
  constructor() { }
  public validate(values: any[], messages: string[], success: any, error: any) {
    let result = true;
    for (let i = 0; i < values.length; i++) {
      if (!values[i]) {
        result = false;
        error(messages[i]);
        break;
      }
    }
    if (result) {
      success();
    }
  }
  public makeId(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  public async isAdmin() {
    if (!this.roleAdmin)
      this.roleAdmin = await new Parse.Query(Parse.Role).equalTo('name', 'admin').equalTo('users', Parse.User.current()).first();
    return this.roleAdmin !== undefined;
  }
  public genericObject(className: string){
    const Generic = Parse.Object.extend(className);
    return new Generic();
  }
  public async getACL() {
    const roles = await new Parse.Query(Parse.Role).find();
    const acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    roles.forEach((role) => {
      acl.setWriteAccess(role, true);
    });
    return acl;
  }
}
