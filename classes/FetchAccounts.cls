public class FetchAccounts {
    @AuraEnabled(cacheable=true)
    public static list<Account> getAccounts(String searchAcc, Integer limitRecds){
        //String name = '\'%'+String.escapeSingleQuotes(searchAcc)+'%\'';
        String queryExp ='Select Id,Name from account where name like ' + '\'%'+String.escapeSingleQuotes(searchAcc)+'%\'' + ' limit ' + limitRecds;
        List<Account> accts = Database.query(queryExp);
        return accts;
    }
@AuraEnabled(cacheable=true)
    public static list<Account> getAccountsByType(String searchAccByType){
        String queryExp ='Select Id,Name,Type,Phone,Website,AnnualRevenue,NumberOfEmployees,Site,Industry from account where type ='+'\''+string.escapeSingleQuotes(searchAccByType)+'\'';
        List<Account> accts = Database.query(queryExp);
        return accts;
    }
}