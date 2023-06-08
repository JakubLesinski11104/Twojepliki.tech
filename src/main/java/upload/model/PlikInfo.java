package upload.model;

public class PlikInfo {
  private String nazwa;
  private String url;

  public PlikInfo(String nazwa, String url) {
    this.nazwa = nazwa;
    this.url = url;
  }

  public String getName() {
    return this.nazwa;
  }

  public void setName(String nazwa) {
    this.nazwa = nazwa;
  }

  public String getUrl() {
    return this.url;
  }

  public void setUrl(String url) {
    this.url = url;
  }
}
