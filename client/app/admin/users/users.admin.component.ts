import { Component, OnInit } from '@angular/core';
import { Language, TranslationService } from 'angular-l10n';
import { ToastComponent } from '../../shared/toast/toast.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.admin.component.html'
})
export class AdminUsersComponent implements OnInit {
  @Language() lang: string;

  users: User[] = [];
  isLoading = true;

  constructor(public auth: AuthService,
              public toast: ToastComponent,
              private userService: UserService,
              public translation: TranslationService) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      data => this.users = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  deleteUser(user: User) {
    if (window.confirm(this.translation.translate('_CONFIRM_DELETE_') + ' ' + user.username + '?')) {
      this.userService.deleteUser(user).subscribe(
        data => this.toast.setMessage(this.translation.translate('_USER_DELETED_'), 'success'),
        error => console.log(error),
        () => this.getUsers()
      );
    }
  }

  changeUserRole(user: User) {
    if(user.role == 'admin') {
      if (window.confirm(this.translation.translate('_REVOKE_ADMIN_') + ' ' + user.username + ' ?')) {
        user.role = 'user';
        this.userService.editUser(user).subscribe(
          data => this.toast.setMessage(this.translation.translate('_REVOKE_ADMIN_DONE_') + ' ' + user.username + '.', 'success'),
          error => console.log(error),
          () => this.getUsers()
        );
      }
    } else {
      if (window.confirm(this.translation.translate('_GRANT_ADMIN_') + ' ' + user.username + ' ?')) {
        user.role = 'admin';
        this.userService.editUser(user).subscribe(
          data => this.toast.setMessage(this.translation.translate('_GRANT_ADMIN_DONE_') + ' ' + user.username + '.', 'success'),
          error => console.log(error),
          () => this.getUsers()
        );
      }
    }
  }

}
