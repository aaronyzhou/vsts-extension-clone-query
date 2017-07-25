///<reference types="vss-web-extension-sdk" />
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { QueryHierarchyItem } from "TFS/WorkItemTracking/Contracts";

var actionProvider = {
    getMenuItems: (context) => {
        return [<IContributedMenuItem>{
            icon: "fabric://Copy",
            title: "Clone Query",
            action: (actionContext) => {
                const webContext = VSS.getWebContext();
                const lastPath = actionContext.query.path.lastIndexOf("/");
                const name = actionContext.query.name + '-copy';

                const tryCreateQuery = (queryName:string, tries:number) => {
                    const queryItem = <QueryHierarchyItem>{
                        wiql: actionContext.query.wiql,
                        path: actionContext.query.path.slice(0,lastPath),
                        name: queryName
                    };
                    getClient().createQuery(queryItem, webContext.project.name, actionContext.query.path.slice(0,lastPath))
                    .then((query)=>{
                        console.log("created " + query.name);
                        //reload the new page so the new queries can be visible
                        VSS.getService(VSS.ServiceIds.Navigation).then((navigationService:any)=>{
                            navigationService.reload();
                        });
                    }, (reason)=>{
                        if(reason.message.indexOf("TF237018") !== -1) { 
                            if(tries > 1) {
                                tryCreateQuery(name + '-copy ('+ tries.toString() + ')', tries+1);
                            } else {
                                tryCreateQuery(name + '-copy', tries+1);
                            }
                        } else {
                            alert("Failed to create clone query"); 
                        }
                    });
                }
                tryCreateQuery(name, 0);                
            }
        }];
    }
};

// Register context menu action provider
VSS.register(VSS.getContribution().id, actionProvider);