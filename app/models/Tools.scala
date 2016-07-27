package models

import javax.naming.Context
import javax.naming.directory.InitialDirContext
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Created by zhangxu on 2016/7/21.
  */
object Tools {
  def authLDAP(username: String, password: String): Future[Boolean] = Future {
    val env = new java.util.Hashtable[String, String]();
    val LDAP_URL = "ldap://10.65.110.12:389"
    val user = username
    val pass = password
    env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
    env.put(Context.SECURITY_AUTHENTICATION, "simple");
    env.put(Context.PROVIDER_URL, LDAP_URL);
    env.put(Context.SECURITY_PRINCIPAL, s"WEIBOPAY\\$user");
    env.put(Context.SECURITY_CREDENTIALS, pass);
    var dc: InitialDirContext = null
    try {
      dc = new InitialDirContext(env);
      true
    } catch {
      case ex: Exception =>
        println(ex.getMessage)
        false
    } finally {
      if (dc != null)
        dc.close()
    }
  }

//  def main(args: Array[String]) {
//    println(1)
//  }
}
