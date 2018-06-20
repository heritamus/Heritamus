import { Component, OnInit } from '@angular/core';
import { TypesService } from '../../services/types.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { Type } from '../../shared/models/type.model';
import { nodeTypes } from '../../../static/nodeTypes';
import { relationTypes } from '../../../static/relationTypes';
import { Language, TranslationService } from 'angular-l10n';

@Component({
  selector: 'app-admin-types',
  templateUrl: './types.admin.component.html'
})
export class AdminTypesComponent implements OnInit {
  @Language() lang: string;
  isLoading = true;
  types: Array<Type>;
  filter: string;

  constructor(private typesService: TypesService,
              public toast: ToastComponent,
              public translation: TranslationService) {
  }

  ngOnInit() {
    this.types = [];
    this.filter = 'all';
    for (let t of nodeTypes) {
      let type = new Type();
      type.availability = 'node';
      type.name = t.en;
      type.state = 'default';
      this.types.push(type);
    }
    for (let t of relationTypes) {
      let type = new Type();
      type.availability = 'relation';
      type.name = t.en;
      type.state = 'default';
      this.types.push(type);
    }
    this.typesService.getTypes().subscribe((types: Type[]) => {
      for (let t of types) {
        this.types.push(t);
      }
      this.isLoading = false;
    });
  }

  acceptType(t: Type) {
    let index = this.types.indexOf(t);
    t.state = 'accepted';
    if (confirm(this.translation.translate('_CONFIRM_ACCEPT_TYPE_'))) {
      this.typesService.editType(t).subscribe((s: Type) => {
        this.types[index] = t;
      });
    }
  }

  deleteType(t: Type) {
    let index = this.types.indexOf(t);
    if (confirm(this.translation.translate('_CONFIRM_DELETE_TYPE_'))) {
      this.typesService.deleteType(t).subscribe((s: string) => {
        this.types.splice(index, 1);
      });
    }
  }
}
