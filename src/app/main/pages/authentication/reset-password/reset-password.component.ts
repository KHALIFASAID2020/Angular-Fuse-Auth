import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthetificationService } from '../serviceAuth/authetification.service';

@Component({
    selector     : 'reset-password',
    templateUrl  : './reset-password.component.html',
    styleUrls    : ['./reset-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ResetPasswordComponent implements OnInit, OnDestroy
{
    resetPasswordForm: FormGroup;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private activeRoute: ActivatedRoute,
        private _authetificationService :AuthetificationService,
        private router: Router
    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.resetPasswordForm = this._formBuilder.group({
            email          : ['', [Validators.required, Validators.email]],
            password       : ['', Validators.required],
            password_confirmation: ['', [Validators.required, confirmPasswordValidator]]
        });

        // Update the validity of the 'password_confirmation' field
        // when the 'password' field changes
        this.resetPasswordForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.resetPasswordForm.get('password_confirmation').updateValueAndValidity();
            });
    }
    onResetPassword(resetPasswordForm){
        resetPasswordForm.token= this.activeRoute.snapshot.params.id;
        this._authetificationService.onResetPassword(resetPasswordForm).pipe(first()).subscribe(
            data=>{

                console.log(data);
                this.router.navigate(['/pages/auth/login']);
            },error =>{
                //this.error ='Please enter a valid password or email';
                console.log(error);
            
            }
        )
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if ( !control.parent || !control )
    {
        return null;
    }

    const password = control.parent.get('password');
    const password_confirmation = control.parent.get('password_confirmation');

    if ( !password || !password_confirmation )
    {
        return null;
    }

    if ( password_confirmation.value === '' )
    {
        return null;
    }

    if ( password.value === password_confirmation.value )
    {
        return null;
    }

    return {passwordsNotMatching: true};
};
