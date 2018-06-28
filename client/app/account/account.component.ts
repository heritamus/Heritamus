import { Component, OnInit } from '@angular/core'
import { Language, TranslationService } from 'angular-l10n'
import { ToastComponent } from '../shared/toast/toast.component'
import { AuthService } from '../services/auth.service'
import { UserService } from '../services/user.service'
import { User } from '../shared/models/user.model'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {
  @Language() lang: string

  form: FormGroup
  user: User
  isLoading = true

  constructor (public toast: ToastComponent,
               public translation: TranslationService,
               private fb: FormBuilder,
               private userService: UserService,
               private auth: AuthService) {
  }

  ngOnInit () {
    this.buildForm()
    this.getUser()
  }

  updateUser () {
    let newUser: User = this.form.value
    this.user.username = newUser.username
    this.user.email = newUser.email
    this.user.password = newUser.password || this.user.password
    this.userService.editUser(this.user).subscribe(
        res => this.toast.setMessage(this.translation.translate('_ACCOUNT_SAVED_'), 'success'),
        error => {
          console.log(error)
          this.toast.setMessage(this.translation.translate('_ERROR_'), 'danger')
        }
    )
  }

  private getUser () {
    this.userService.getUser(this.auth.currentUser).subscribe(
        data => this.user = data,
        error => console.log(error),
        () => this.isLoading = false
    )
  }

  private buildForm() {
    this.form = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
        Validators.pattern('[a-zA-Z0-9_-\\s]*')
      ]],
      email: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.email,
        Validators.maxLength(100)
      ]],
      password: ['', [
        // Validators.required,
        Validators.minLength(6)
      ]]
    })
  }

}
