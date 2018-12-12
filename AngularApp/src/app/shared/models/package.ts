export interface Package {
    codeString: string;
    dllBytes: string;
    pdbBytes: string;
    id: string;
    committedByAlias: string;
}


export interface DetectorCommit {
    sha: string;
    author: string;
    date: string;
    previousSha: string;
    onClick: Function;
    isSelected: boolean;

    // constructor(sha: string, author: string, date: string, previousSha: string, onClick: Function = null) {
    //   this.sha = sha;
    //   this.author = author;
    //   this.date = date;
    //   this.previousSha = previousSha;
    //   this.onClick = onClick;
    // }

    // constructor(label: string, onClick: Function, isSelected: Function, icon: string = null, expanded: boolean = false, subItems: CollapsibleMenuItem[] = []) {
    //     this.label = label;
    //     this.onClick = onClick;
    //     this.expanded = expanded;
    //     this.subItems = subItems;
    //     this.isSelected = isSelected;
    //     this.icon = icon;
    //   }

}