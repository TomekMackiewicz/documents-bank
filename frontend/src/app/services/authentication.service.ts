import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http'; // @angular/common/http
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {

    private subject = new Subject<any>();

    getUsername(): Observable<any> {
        return this.subject.asObservable();
    }

    constructor(private http: Http) {
        var currentUsername = localStorage.getItem('currentUsername');        
    }

    login(username: string, password: string) {
        return this.http.post('http://localhost:8000/api/login_check', { username: username, password: password })
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let token = response.json();
                if (token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('token', JSON.stringify(token));
                    localStorage.setItem('currentUsername', username);
                    this.subject.next(localStorage.getItem('currentUsername'));
                }
            });
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUsername');
        this.subject.next();
    }
    
    register(email: string, username: string, password: string) {
        return this.http.post('http://localhost:8000/api/register', { 
            email: email, 
            username: username, 
            plainPassword: password 
        }).map((response: Response) => {
            //let result = response.json();
        }).catch(this.handleError);      
    }
    
    changePassword(user:number, currentPassword: string, newPassword: string, confirmPassword: string) {
        return this.http.patch('http://localhost:8000/api/password/'+user+'/change', { 
            currentPassword: currentPassword, 
            newPassword: newPassword,
            confirmPassword: confirmPassword, 
        })
            .map((response: Response) => {
                // ...
            });        
    }

    private handleError(error: any) {
        let errorResponse = JSON.parse(error._body);
        let errors = getErrors(errorResponse.errors);       
        let errMsg = errors ? errors : errorResponse.message ? errorResponse.message : 'Validstion failed';

        return Observable.throw(errMsg);
    }
    
    function getErrors(formErrors: any) {       
        let errors = Object.values(formErrors.children);
        let msg = new String();        
        for (let err of errors) {
            if (err.errors) { 
                msg = msg.concat(err.errors[0]);
                msg = msg.concat("\n");
            }           
        }
        
        return msg;              
    }
    
}

